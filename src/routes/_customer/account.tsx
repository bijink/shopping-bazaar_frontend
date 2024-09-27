import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import UserAccountDeleteConfirmation from '../../components/UserAccountDeleteConfirmation';
import useLocalUser from '../../hooks/useLocalUser';
import { User } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';
import stringOps from '../../utils/stringOps';

export const Route = createFileRoute('/_customer/account')({
  component: AccountComponent,
});

function AccountComponent() {
  const user = useLocalUser();
  const queryClient = useQueryClient();
  const [openAccountEdit, setOpenAccountEdit] = useState(false);
  const [openAccountDeleteDialog, setOpenAccountDeleteDialog] = useState(false);

  const { data: userDetails, isLoading } = useQuery({
    queryKey: ['user', user?._id],
    queryFn: () =>
      axiosInstance.get(`user/get-user-details/${user?._id}`).then((res) => res.data as User),
    staleTime: 1000 * 60 * 5,
    enabled: !!user && user.role === 'customer',
  });

  const formSubmitMutation = useMutation({
    mutationFn: (formData: {
      fname: string;
      lname: string;
      address: {
        fullname: string;
        building: string;
        street: string;
        town: string;
        state: string;
        pincode: string;
        landmark: string;
      };
      mobile: string;
    }) => {
      return axiosInstance.patch(`/user/update-details/${user?._id}`, formData);
    },
    onError: async (error) => {
      error.message = error.response?.data?.message || error.message;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'], refetchType: 'all' });
      setOpenAccountEdit(false);
    },
  });
  const form = useForm({
    defaultValues: {
      fname: userDetails?.fname || '',
      lname: userDetails?.lname || '',
      fullname: userDetails?.address?.fullname || '',
      building: userDetails?.address?.building || '',
      street: userDetails?.address?.street || '',
      town: userDetails?.address?.town || '',
      state: userDetails?.address?.state || '',
      pincode: userDetails?.address?.pincode || '',
      landmark: userDetails?.address?.landmark || '',
      mobile: userDetails?.mobile || '',
    },
    onSubmit: async ({ value }) => {
      await formSubmitMutation.mutateAsync({
        fname: value.fname,
        lname: value.lname,
        address: {
          fullname: value.fullname,
          building: value.building,
          street: value.street,
          town: value.town,
          state: value.state,
          pincode: value.pincode,
          landmark: value.landmark,
        },
        mobile: value.mobile,
      });
    },
  });

  return (
    <>
      <UserAccountDeleteConfirmation
        open={openAccountDeleteDialog}
        setOpen={setOpenAccountDeleteDialog}
      />
      <div className="pt-4">
        <div className="flex flex-row items-center space-x-4">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Account</h3>
        </div>
        <div className="mt-6">
          {!openAccountEdit ? (
            <div>
              {!isLoading && (
                <div className="w-1/2">
                  <p>
                    Name:{' '}
                    <span className="font-bold">{`${userDetails?.fname} ${userDetails?.lname}`}</span>
                  </p>
                  <p>
                    Email: <span className="font-bold">{userDetails?.email}</span>
                  </p>
                  {userDetails?.address ? (
                    <div>
                      <p>Address: </p>
                      <div>
                        <p className="font-bold">{userDetails?.address?.fullname}</p>
                        <p className="">{userDetails?.address?.building},</p>
                        <p className="">
                          <span>{userDetails?.address?.street}</span>,{' '}
                          <span>{userDetails?.address?.town}</span>,
                        </p>
                        <p className="">
                          <span>{stringOps.uppercase(userDetails?.address?.state as string)}</span>{' '}
                          <span className="">{userDetails?.address?.pincode}</span>{' '}
                          <span className="">India</span>
                        </p>
                      </div>
                      <p className="">
                        Phone number: <span className="font-bold">{userDetails?.mobile}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 font-thin">
                      No address is added. Click <span className="font-normal">Update</span> button
                      to add address.
                    </p>
                  )}
                  <div className="flex flex-row space-x-2">
                    <button
                      onClick={() => setOpenAccountEdit(true)}
                      className="mt-6 flex justify-center rounded-[4px] bg-indigo-600 px-5 py-1 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Update
                    </button>
                    <button
                      className="mt-6 flex w-full justify-center rounded-md bg-red-600 px-5 py-1 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 lg:max-w-fit"
                      onClick={() => setOpenAccountDeleteDialog(true)}
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <div className="flex w-full flex-col lg:w-1/2">
                <div className="w-full space-y-4">
                  <div>
                    <form.Field
                      name="fname"
                      children={(field) => (
                        <>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            First name
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            type="text"
                            autoComplete="name"
                            className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                          />
                        </>
                      )}
                    />
                  </div>
                  <div>
                    <form.Field
                      name="lname"
                      children={(field) => (
                        <>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Last name
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            type="text"
                            autoComplete="name"
                            className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                          />
                        </>
                      )}
                    />
                  </div>
                </div>
                <div className="mt-4 w-full">
                  <p className="text-xl text-gray-900">Address</p>
                  <div className="space-y-4 px-0 pt-1">
                    <div>
                      <form.Field
                        name="fullname"
                        children={(field) => (
                          <>
                            <label
                              htmlFor={field.name}
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Full name
                            </label>
                            <input
                              id={field.name}
                              name={field.name}
                              className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              required
                            />
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <form.Field
                        name="building"
                        children={(field) => (
                          <>
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={field.name}
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Flat, House no., Building
                              </label>
                            </div>
                            <input
                              id={field.name}
                              name={field.name}
                              type="text"
                              className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              required
                            />
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <form.Field
                        name="street"
                        children={(field) => (
                          <>
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={field.name}
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Area, Street, Village
                              </label>
                            </div>
                            <input
                              id={field.name}
                              name={field.name}
                              type="text"
                              className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              required
                            />
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <form.Field
                        name="town"
                        children={(field) => (
                          <>
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={field.name}
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Town/City
                              </label>
                            </div>
                            <input
                              id={field.name}
                              name={field.name}
                              type="text"
                              className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              required
                            />
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <form.Field
                        name="state"
                        children={(field) => (
                          <>
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={field.name}
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                State
                              </label>
                            </div>
                            <input
                              id={field.name}
                              name={field.name}
                              type="text"
                              className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              required
                            />
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <form.Field
                        name="pincode"
                        children={(field) => (
                          <>
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={field.name}
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Pincode
                              </label>
                            </div>
                            <input
                              id={field.name}
                              name={field.name}
                              type="number"
                              className="hide-number-input-arrow mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="6-digit pincode"
                              required
                            />
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <form.Field
                        name="landmark"
                        children={(field) => (
                          <>
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={field.name}
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Landmark
                              </label>
                            </div>
                            <input
                              id={field.name}
                              name={field.name}
                              type="text"
                              className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              required
                            />
                          </>
                        )}
                      />
                    </div>
                    <div>
                      <form.Field
                        name="mobile"
                        children={(field) => (
                          <>
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={field.name}
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Mobile number
                              </label>
                            </div>
                            <input
                              id={field.name}
                              name={field.name}
                              type="number"
                              className="hide-number-input-arrow mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              required
                            />
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-row justify-end space-x-2 pt-6 lg:w-1/2">
                <button
                  onClick={() => setOpenAccountEdit(false)}
                  className="flex w-full justify-center rounded-md bg-gray-500 px-6 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 lg:w-[6rem]"
                >
                  Cancel
                </button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="flex w-full justify-center rounded-md bg-indigo-600 px-6 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:w-[8rem]"
                    >
                      {isSubmitting ? 'Loading...' : 'Update'}
                    </button>
                  )}
                />
                {formSubmitMutation.isError && (
                  <p className="text-sm text-red-500">{formSubmitMutation?.error?.message}</p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
