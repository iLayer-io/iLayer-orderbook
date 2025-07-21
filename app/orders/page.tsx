'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
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
import { formatEther } from 'viem';

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

const ORDER_HUB_ADDRESS = process.env.NEXT_PUBLIC_ORDER_HUB_ADDRESS as `0x${string}`;

export default function OrdersPage() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const { writeContractAsync } = useWriteContract();
    const [orders, setOrders] = useState<OrderEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [maxOrderDeadline, setMaxOrderDeadline] = useState<bigint>(BigInt(0));
    const [timeBuffer, setTimeBuffer] = useState<bigint>(BigInt(0));

    useEffect(() => {
        if (!address || !publicClient) return;

        const fetchOrdersAndConfig = async () => {
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

                // Get user's address as bytes32
                const userBytes32 = `0x${address.slice(2).padStart(64, '0')}` as const;

                // Fetch OrderCreated events for the user
                const createdEvents = await publicClient.getLogs({
                    address: ORDER_HUB_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'OrderCreated',
                        inputs: [
                            { name: 'orderId', type: 'bytes32', indexed: true },
                            { name: 'nonce', type: 'uint64', indexed: false },
                            { name: 'order', type: 'tuple', indexed: false },
                            { name: 'caller', type: 'address', indexed: true },
                        ],
                    },
                    args: {
                        caller: address,
                    },
                    fromBlock: 'earliest',
                });

                // Fetch OrderSettled events
                const settledEvents = await publicClient.getLogs({
                    address: ORDER_HUB_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'OrderSettled',
                        inputs: [
                            { name: 'orderId', type: 'bytes32', indexed: true },
                            { name: 'order', type: 'tuple', indexed: false },
                        ],
                    },
                    fromBlock: 'earliest',
                });

                // Fetch OrderWithdrawn events
                const withdrawnEvents = await publicClient.getLogs({
                    address: ORDER_HUB_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'OrderWithdrawn',
                        inputs: [
                            { name: 'orderId', type: 'bytes32', indexed: true },
                            { name: 'caller', type: 'address', indexed: true },
                        ],
                    },
                    args: {
                        caller: address,
                    },
                    fromBlock: 'earliest',
                });

                // Get current timestamp
                const currentBlock = await publicClient.getBlock();
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
