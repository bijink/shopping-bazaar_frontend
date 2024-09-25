import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Fragment, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import useLocalUser from '../hooks/useLocalUser';
import { Order } from '../types/global.type';
import { axiosInstance } from '../utils/axios';
import stringOps from '../utils/stringOps';
import LoadingSpinner from './LoadingSpinner';
import OrderCancelConfirmation from './OrderCancelConfirmation';

const orderStatusColors = {
  placed: 'bg-gray-100 text-gray-800',
  'on-packing': 'bg-amber-100 text-amber-800',
  'on-shipping': 'bg-blue-100 text-blue-800',
  'on-delivering': 'bg-sky-100 text-sky-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Orders({
  data: { orders, isLoading, showOrderedItems, setShowOrderedItems },
}: {
  data: {
    orders: Order[] | undefined;
    isLoading: boolean;
    showOrderedItems: { [key: string]: boolean };
    setShowOrderedItems: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  };
}) {
  const user = useLocalUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [cancellingOrderId, setCancellingOrderId] = useState('');
  const [orderCancelConfirmDialogOpen, setOrderCancelConfirmDialogOpen] = useState(false);

  const handleOrderCancelBtn = (orderId: string) => {
    setCancellingOrderId(orderId);
    setOrderCancelConfirmDialogOpen(true);
  };
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    await axiosInstance
      .patch(`/admin/change-order-status/${orderId}`, { status })
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: ['orders', 'admin'], refetchType: 'all' });
      });
  };

  return (
    <>
      <OrderCancelConfirmation
        open={cancellingOrderId.length ? orderCancelConfirmDialogOpen : false}
        setOpen={setOrderCancelConfirmDialogOpen}
        orderId={cancellingOrderId}
      />
      <div className="pt-4">
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {user?.role === 'customer' ? 'Orders' : 'All orders'}
        </h3>
        <div className="pt-8">
          {!isLoading && orders?.length ? (
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
                          <span
                            className={twMerge(
                              'rounded-full px-2 py-1 text-xs font-normal',
                              orderStatusColors[
                                order.orderStatus as keyof typeof orderStatusColors
                              ],
                            )}
                          >
                            Order <span className="font-semibold">{order.orderStatus}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-700">Delivery Details</h3>
                      <div className="space-y-2 text-gray-600">
                        <p>{stringOps.capitalize(order.deliveryDetails.name)}</p>
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
                        {user?.role === 'customer' ? (
                          order.orderStatus === 'placed' && (
                            <div className="flex flex-row justify-end">
                              <button
                                type="button"
                                onClick={() => handleOrderCancelBtn(order._id as string)}
                                className="rounded-md bg-gray-100 px-2 py-1 font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                Cancel order
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="flex flex-row justify-end">
                            {order.orderStatus !== 'delivered' &&
                              order.orderStatus !== 'cancelled' && (
                                <Menu as="div" className="relative inline-block text-left">
                                  <MenuButton className="flex flex-row items-center rounded-md bg-gray-100 px-2 py-1 font-medium text-indigo-600 hover:text-indigo-500">
                                    Change status
                                    <ChevronRightIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                                  </MenuButton>
                                  <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                  >
                                    <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                      <div className="space-y-1 px-1 py-1">
                                        {Object.entries(orderStatusColors).map(
                                          ([status, color]) => {
                                            if (status !== 'cancelled')
                                              return (
                                                <MenuItem key={status}>
                                                  {({ focus }) => (
                                                    <button
                                                      className={twMerge(
                                                        focus ? 'bg-indigo-500 text-white' : color,
                                                        'group flex w-full items-center rounded-md px-2 py-2 text-sm capitalize disabled:bg-white disabled:text-gray-300',
                                                      )}
                                                      onClick={() =>
                                                        handleOrderStatusChange(order._id, status)
                                                      }
                                                      disabled={status === order.orderStatus}
                                                    >
                                                      {status}
                                                    </button>
                                                  )}
                                                </MenuItem>
                                              );
                                          },
                                        )}
                                      </div>
                                    </MenuItems>
                                  </Transition>
                                </Menu>
                              )}
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
            <>{isLoading ? <LoadingSpinner /> : <p>Order list is empty</p>}</>
          )}
        </div>
      </div>
    </>
  );
}
