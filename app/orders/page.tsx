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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { orderHubAbi } from '@/lib/order-hub-abi';
import { Address, formatEther } from 'viem';
import { useConfig } from '@/contexts/ConfigContext';
import { prepareOrderRequest } from '@/lib/order';

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
    transactionHash?: string;
}

export default function OrdersPage() {
    const { address } = useAccount();
    const chainId = useChainId();
    const publicClient = usePublicClient({
        chainId
    });
    const { writeContractAsync } = useWriteContract();
    const [orders, setOrders] = useState<OrderEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [txHashFilter, setTxHashFilter] = useState<string>('');
    const { getHubAddressByChainId } = useConfig();

    const ORDER_HUB_ADDRESS = getHubAddressByChainId(chainId) as Address;

    useEffect(() => {
        if (!address || !publicClient) return;

        const fetchOrdersAndConfig = async (orderTxHash?: string) => {
            setLoading(true);
            if (!orderTxHash) {
                console.warn('No transaction hash provided for order filtering.');
                setOrders([]);
                setLoading(false);
                return;
            }
            if (!ORDER_HUB_ADDRESS) {
                console.error('Order Hub address not found for chain ID:', chainId);
                setLoading(false);
                return;
            }

            try {
                // Fetch contract configuration
                const buffer = await publicClient.readContract({
                    address: ORDER_HUB_ADDRESS,
                    abi: orderHubAbi,
                    functionName: 'timeBuffer',
                });

                // Get current timestamp
                const currentBlock = await publicClient.getBlock();

                let targetBlockNumber: bigint | undefined;

                // If transaction hash is provided, get the block number
                if (orderTxHash) {
                    try {
                        const txReceipt = await publicClient.getTransactionReceipt({
                            hash: orderTxHash as `0x${string}`
                        });
                        targetBlockNumber = txReceipt.blockNumber;
                    } catch (error) {
                        console.error('Error fetching transaction receipt:', error);
                        setOrders([]);
                        return;
                    }
                }

                // Prepare event fetch options
                const eventOptions = {
                    address: ORDER_HUB_ADDRESS,
                    abi: orderHubAbi,
                    ...(targetBlockNumber && {
                        fromBlock: targetBlockNumber,
                        toBlock: targetBlockNumber
                    })
                };

                // Fetch OrderCreated events for the user
                const createdEvents = await publicClient.getContractEvents({
                    ...eventOptions,
                    eventName: 'OrderCreated',
                    args: {
                        caller: address,
                    }
                });

                // Fetch OrderSettled events
                const settledEvents: any = await publicClient.getContractEvents({
                    ...eventOptions,
                    eventName: 'OrderSettled',
                });

                // Fetch OrderWithdrawn events
                const withdrawnEvents = await publicClient.getContractEvents({
                    ...eventOptions,
                    eventName: 'OrderWithdrawn',
                    args: {
                        caller: address,
                    }
                });

                const now = currentBlock.timestamp;

                // Process orders
                const processedOrders: OrderEvent[] = createdEvents.map((event: any) => {
                    const orderId = event.args.orderId!;
                    const isSettled = settledEvents.some((e: any) => e.args.orderId === orderId);
                    const isWithdrawn = withdrawnEvents.some((e: any) => e.args.orderId === orderId);

                    const order = event.args.order as any;
                    const orderDeadline = BigInt(order.deadline);
                    const isExpired = now > orderDeadline && now < orderDeadline + (buffer as bigint);
                    const canWithdraw = orderDeadline + (buffer as bigint) <= now;

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
                            ...order,
                        },
                        status,
                        canWithdraw: canWithdraw && !isSettled && !isWithdrawn,
                        blockTimestamp: BigInt(event.blockNumber),
                        transactionHash: event.transactionHash,
                        ...event.args,
                    };
                });

                setOrders(processedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrdersAndConfig(txHashFilter || undefined);
    }, [address, publicClient, txHashFilter]);

    const handleWithdraw = async (order: any) => {
        try {
            debugger;


            const orderRequest = prepareOrderRequest(
                order.order.user,
                order.order.recipient,
                order.order.callRecipient || order.order.user,
                order.order.inputs,
                order.order.outputs,
                order.order.sourceChainId,
                order.order.destinationChainId,
                order.order.deadline,
                order.nonce,
                order.order.callData || '0x',
                order.order.primaryFillerDeadline || order.order.deadline
            )
            const orderId = await publicClient?.readContract({
                address: ORDER_HUB_ADDRESS,
                abi: orderHubAbi,
                functionName: 'getOrderId',
                args: [orderRequest.order, order.nonce],
            });



            const buffer = await publicClient?.readContract({
                address: ORDER_HUB_ADDRESS,
                abi: orderHubAbi,
                functionName: 'timeBuffer',
            });

            // Get current timestamp
            const currentBlock = await publicClient?.getBlock();

            console.log('Order ID:', orderId);
            console.log('Current Block Timestamp:', currentBlock?.timestamp);
            console.log('Buffer:', buffer);
            console.log('address:', address);
            console.log('Order Request:', orderRequest.order.deadline);


            await publicClient?.estimateContractGas({
                address: ORDER_HUB_ADDRESS,
                abi: orderHubAbi,
                functionName: 'withdrawOrder',
                args: [orderRequest.order, order.nonce],
            })

            console.log('Order ID:', orderId);
            await writeContractAsync({
                address: ORDER_HUB_ADDRESS,
                abi: orderHubAbi,
                functionName: 'withdrawOrder',
                args: [orderRequest.order, order.nonce],
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

    const handleClearFilter = () => {
        setTxHashFilter('');
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
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="tx-hash">Filter by Transaction Hash</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="tx-hash"
                                    placeholder="0x..."
                                    value={txHashFilter}
                                    onChange={(e) => setTxHashFilter(e.target.value)}
                                />
                                {txHashFilter && (
                                    <Button variant="outline" onClick={handleClearFilter}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="text-center p-6">Loading orders...</div>
                    ) : txHashFilter === '' ?
                        <div className="text-center p-6 text-muted-foreground">
                            Please enter a transaction hash to filter orders.
                        </div>
                        : orders.length === 0 ? (
                            <div className="text-center p-6 text-muted-foreground">
                                No orders found for the given transaction hash.
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
                                        <TableHead>Tx Hash</TableHead>
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
                                            <TableCell className="font-mono text-xs">
                                                {order.transactionHash?.slice(0, 10)}...
                                            </TableCell>
                                            <TableCell>
                                                {order.canWithdraw && order.status === 'Pending' && (
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
