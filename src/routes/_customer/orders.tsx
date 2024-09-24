import { Transition } from '@headlessui/react';
import {
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import LoadingSpinner from '../../components/LoadingSpinner';
import OrderCancelConfirmation from '../../components/OrderCancelConfirmation';
import useLocalUser from '../../hooks/useLocalUser';
import { Order } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';
import stringOps from '../../utils/stringOps';

export const Route = createFileRoute('/_customer/orders')({
  component: OrdersComponent,
});

function OrdersComponent() {
  const user = useLocalUser();
  const navigate = useNavigate();

  const [showOrderedItems, setShowOrderedItems] = useState<{ [key: string]: boolean }>({});
  const [cancellingOrderId, setCancellingOrderId] = useState('');
  const [orderCancelConfirmDialogOpen, setOrderCancelConfirmDialogOpen] = useState(false);

  const { data: orders, isLoading: isOrdersFetchLoading } = useQuery({
    queryKey: ['orders', user?._id],
    queryFn: async () => {
      const orders = await axiosInstance
        .get(`/customer/get-orders/${user?._id}`)
        .then((res) => res.data as Order[]);
      setShowOrderedItems(
        (prev) =>
          orders.reduce(
            (acc, curr) => {
              // Keep previous state and add new keys/values
              acc[curr._id] = false; // Set the default value for each key (empty string or any other value)
              return acc;
            },
            { ...prev },
          ), // Spread previous state to retain existing keys
      );
      return orders;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!user && user.role === 'customer',
  });

  const handleOrderCancelBtn = async (orderId: string) => {
    setCancellingOrderId(orderId);
    setOrderCancelConfirmDialogOpen(true);
  };

  return (
    <>
      <OrderCancelConfirmation
        open={cancellingOrderId.length ? orderCancelConfirmDialogOpen : false}
        setOpen={setOrderCancelConfirmDialogOpen}
        orderId={cancellingOrderId}
      />
      <div className="pt-4">
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Orders</h3>
        <div className="pt-8">
          {!isOrdersFetchLoading && orders?.length ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="rounded-lg p-6 shadow-lg">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-700">
                        Order Information
                      </h3>
                      <div className="space-y-2">
                        <p className="flex items-center text-gray-600">
                          <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
                          Date: {new Date(order.date).toLocaleString()}
                        </p>
                        <p className="text-gray-600">Order ID: {order._id}</p>
                        <p className="text-gray-600">
                          Total Amount: <span>&#8377;</span>
                          {order.totalAmount}
                        </p>
                        <p className="text-gray-600">Payment Method: {order.paymentMethod}</p>
                        <div className="flex space-x-2">
                          {order.orderStatus === 'placed' ? (
                            <>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-normal ${order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                              >
                                Payment <span className="font-semibold">{order.paymentStatus}</span>
                              </span>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-normal ${order.deliveryStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                              >
                                Delivery{' '}
                                <span className="font-semibold">{order.deliveryStatus}</span>
                              </span>
                            </>
                          ) : (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-normal ${order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                            >
                              Order <span className="font-semibold">{order.orderStatus}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-700">Delivery Details</h3>
                      <div className="space-y-2 text-gray-600">
                        <p className="flex items-center">
                          <MapPinIcon className="mr-2 h-5 w-5 text-gray-500" />
                          {order.deliveryDetails.address}
                        </p>
                        <p>Landmark: {order.deliveryDetails.landmark}</p>
                        <p>Pincode: {order.deliveryDetails.pincode}</p>
                        <p className="flex items-center">
                          <PhoneIcon className="mr-2 h-5 w-5 text-gray-500" />
                          {order.deliveryDetails.mobile}
                        </p>
                        {order.deliveryStatus === 'pending' && (
                          <div className="flex flex-row justify-end">
                            <button
                              type="button"
                              onClick={() => handleOrderCancelBtn(order._id as string)}
                              className="rounded-md bg-gray-100 px-2 py-1 font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Cancel order
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() =>
                        setShowOrderedItems((prev) => ({ ...prev, [order._id]: !prev[order._id] }))
                      }
                    >
                      <h3 className="text-lg font-semibold text-gray-700">Ordered Items</h3>
                      <button className="flex items-center justify-center rounded-md bg-gray-50 p-1 text-indigo-600 hover:text-indigo-800">
                        {showOrderedItems[order._id] ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <Transition
                      show={showOrderedItems[order._id] || false}
                      enter="transition-all duration-300 ease-out"
                      enterFrom="opacity-0 max-h-0"
                      enterTo="opacity-100 max-h-[1000px]"
                      leave="transition-all duration-200 ease-in"
                      leaveFrom="opacity-100 max-h-[1000px]"
                      leaveTo="opacity-0 max-h-0"
                    >
                      <div className="mt-4 space-y-4 overflow-hidden">
                        {order.orderedItems.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                          >
                            <div className="flex items-center space-x-4">
                              <div>
                                <div className="flex flex-row space-x-2">
                                  <h4
                                    className={twMerge(
                                      'font-semibold text-gray-800',
                                      order.orderStatus === 'cancelled' && 'line-through',
                                    )}
                                  >
                                    {item.name}
                                  </h4>
                                  <ArrowTopRightOnSquareIcon
                                    className="w-4 cursor-pointer text-indigo-700"
                                    onClick={() => {
                                      navigate({
                                        to: '/product/$productId',
                                        params: { productId: item.product_id },
                                      });
                                    }}
                                  />
                                </div>
                                <p className="text-sm text-gray-600">
                                  Size: {item.size.toUpperCase()}
                                </p>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span>Color:</span>
                                  <span>{stringOps.capitalizeFirstWord(item.color.name)}</span>
                                  <span
                                    className="h-4 w-4 cursor-pointer rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.color.hex }}
                                    data-twe-toggle="tooltip"
                                    title={stringOps.capitalizeFirstWord(item.color.name)}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={twMerge(
                                  'font-semibold text-gray-800',
                                  order.orderStatus === 'cancelled' && 'line-through',
                                )}
                              >
                                <span>&#8377;</span>
                                {item.price}
                              </p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Transition>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>{isOrdersFetchLoading ? <LoadingSpinner /> : <p>Order list is empty</p>}</>
          )}
        </div>
      </div>
    </>
  );
}
