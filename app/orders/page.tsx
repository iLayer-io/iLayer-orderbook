'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, usePublicClient, useWriteContract } from 'wagmi';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orderHubAbi } from '@/lib/order-hub-abi';
import { Address, formatEther } from 'viem';
import { useConfig } from '@/contexts/ConfigContext';
import { eventNames } from 'process';

interface OrderEvent {
    orderId: string;
    nonce: bigint;
    order: {
        user: string;
        recipient: string;
        deadline: bigint;
        sourceChainId: number;
        destinationChainId: number;
        inputs: Array<{
            tokenType: number;
            tokenAddress: string;
            amount: bigint;
        }>;
        outputs: Array<{
            tokenType: number;
            tokenAddress: string;
            amount: bigint;
        }>;
    };
    status: 'Pending' | 'Executed' | 'Expired' | 'Withdrawn';
    canWithdraw: boolean;
    blockTimestamp: bigint;
}

export default function OrdersPage() {
    const { address } = useAccount();
    const chainId = useChainId();
    const publicClient = usePublicClient({
        chainId
    });
    const { writeContractAsync } = useWriteContract();
    const [orders, setOrders] = useState<OrderEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [maxOrderDeadline, setMaxOrderDeadline] = useState<bigint>(BigInt(0));
    const [timeBuffer, setTimeBuffer] = useState<bigint>(BigInt(0));
    const { getHubAddressByChainId } = useConfig();

    const ORDER_HUB_ADDRESS = getHubAddressByChainId(chainId) as Address;

    useEffect(() => {
        if (!address || !publicClient) return;

        const fetchOrdersAndConfig = async () => {
            debugger;
            if (!ORDER_HUB_ADDRESS) {
                console.error('Order Hub address not found for chain ID:', chainId);
                setLoading(false);
                return;
            }

            try {
                // Fetch contract configuration
                const [maxDeadline, buffer] = await Promise.all([
                    publicClient.readContract({
                        address: ORDER_HUB_ADDRESS,
                        abi: orderHubAbi,
                        functionName: 'maxOrderDeadline',
                    }),
                    publicClient.readContract({
                        address: ORDER_HUB_ADDRESS,
                        abi: orderHubAbi,
                        functionName: 'timeBuffer',
                    }),
                ]);

                setMaxOrderDeadline(maxDeadline as bigint);
                setTimeBuffer(buffer as bigint);

                // Get current timestamp
                const currentBlock = await publicClient.getBlock();

                // Fetch OrderCreated events for the user
                const createdEvents = await publicClient.getContractEvents({
                    address: ORDER_HUB_ADDRESS,
                    abi: orderHubAbi,
                    eventName: 'OrderCreated',
                    args: {
                        caller: address,
                    },

                });

                // Fetch OrderSettled events
                const settledEvents = await publicClient.getContractEvents({
                    abi: orderHubAbi,
                    address: ORDER_HUB_ADDRESS,
                    eventName: 'OrderSettled',
                });

                // Fetch OrderWithdrawn events
                const withdrawnEvents = await publicClient.getContractEvents({
                    abi: orderHubAbi,
                    address: ORDER_HUB_ADDRESS,
                    eventName: 'OrderWithdrawn',
                    args: {
                        caller: address,
                    },
                });


                const now = currentBlock.timestamp;

                // Process orders
                const processedOrders: OrderEvent[] = createdEvents.map((event) => {
                    const orderId = event.args.orderId!;
                    const isSettled = settledEvents.some(e => e.args.orderId === orderId);
                    const isWithdrawn = withdrawnEvents.some(e => e.args.orderId === orderId);

                    const order = event.args.order as any;
                    const orderDeadline = BigInt(order.deadline);
                    const isExpired = now > orderDeadline + (maxDeadline as bigint);
                    const canWithdraw = now > orderDeadline + (buffer as bigint);

                    let status: OrderEvent['status'] = 'Pending';
                    if (isWithdrawn) {
                        status = 'Withdrawn';
                    } else if (isSettled) {
                        status = 'Executed';
                    } else if (isExpired) {
                        status = 'Expired';
                    }

                    return {
                        orderId: orderId as string,
                        nonce: event.args.nonce as bigint,
                        order: {
                            user: order.user,
                            recipient: order.recipient,
                            deadline: BigInt(order.deadline),
                            sourceChainId: Number(order.sourceChainId),
                            destinationChainId: Number(order.destinationChainId),
                            inputs: order.inputs,
                            outputs: order.outputs,
                        },
                        status,
                        canWithdraw: canWithdraw && !isSettled && !isWithdrawn,
                        blockTimestamp: BigInt(event.blockNumber),
                    };
                });

                setOrders(processedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrdersAndConfig();
    }, [address, publicClient, maxOrderDeadline, timeBuffer]);

    const handleWithdraw = async (order: OrderEvent) => {
        try {
            await writeContractAsync({
                address: ORDER_HUB_ADDRESS,
                abi: orderHubAbi,
                functionName: 'withdrawOrder',
                args: [order.order, order.nonce],
            });
        } catch (error) {
            console.error('Error withdrawing order:', error);
        }
    };

    const getStatusBadgeVariant = (status: OrderEvent['status']) => {
        switch (status) {
            case 'Pending':
                return 'secondary';
            case 'Executed':
                return 'default';
            case 'Expired':
                return 'destructive';
            case 'Withdrawn':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const formatTokenAmount = (amount: bigint, decimals = 18) => {
        return parseFloat(formatEther(amount)).toFixed(4);
    };

    if (!address) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">
                            Please connect your wallet to view your orders.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center p-6">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center p-6 text-muted-foreground">
                            No orders found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Source Chain</TableHead>
                                    <TableHead>Destination Chain</TableHead>
                                    <TableHead>Input Amount</TableHead>
                                    <TableHead>Output Amount</TableHead>
                                    <TableHead>Deadline</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.orderId}>
                                        <TableCell className="font-mono text-xs">
                                            {order.orderId.slice(0, 10)}...
                                        </TableCell>
                                        <TableCell>{order.order.sourceChainId}</TableCell>
                                        <TableCell>{order.order.destinationChainId}</TableCell>
                                        <TableCell>
                                            {order.order.inputs.length > 0 &&
                                                formatTokenAmount(order.order.inputs[0].amount)
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {order.order.outputs.length > 0 &&
                                                formatTokenAmount(order.order.outputs[0].amount)
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {new Date(Number(order.order.deadline) * 1000).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {order.canWithdraw && order.status === 'Expired' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleWithdraw(order)}
                                                >
                                                    Withdraw
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
