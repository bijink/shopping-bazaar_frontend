import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { axiosInstance } from '../utils/axios';

export default function Signup() {
  const navigate = useNavigate({ from: '/signup' });

  const [emailInput, setEmailInput] = useState('');

  const otpSendMutation = useMutation({
    mutationFn: (email: string) => {
      return axiosInstance.post('/auth/send-otp', { email }, { timeout: 0 });
    },
    onError: (error) => {
      error.message = error.response.data.message || error.message;
    },
  });
  const formSubmitMutation = useMutation({
    mutationFn: (formData: {
      fname: string;
      lname: string;
      email: string;
      password: string;
      passwordConfirmation: string;
      otp: string;
    }) => {
      return axiosInstance.post('/auth/signup', formData);
    },
    onError: (error) => {
      error.message = error.response.data.message || error.message;
    },
    onSuccess: (data) => {
      Cookies.set('token', data.data.token, { expires: 7, secure: true });
      navigate({ to: '/' });
    },
  });
  const form = useForm({
    defaultValues: {
      fname: '',
      lname: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      otp: '',
    },
    onSubmit: async ({ value }) => {
      formSubmitMutation.mutate(value);
    },
  });

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create an account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
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
                      required
                      autoComplete="name"
                      className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                      required
                      autoComplete="name"
                      className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </>
                )}
              />
            </div>
            <div>
              <form.Field
                name="email"
                children={(field) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Email address
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="email"
                      required
                      autoComplete="email"
                      className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        setEmailInput(e.target.value);
                      }}
                    />
                  </>
                )}
              />
            </div>
            <div>
              <form.Field
                name="password"
                children={(field) => (
                  <>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Password
                      </label>
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type="password"
                      required
                      className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </>
                )}
              />
            </div>
            <div>
              <form.Field
                name="passwordConfirmation"
                children={(field) => (
                  <>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Confirm password
                      </label>
                    </div>
                    <input
                      id={field.name}
                      name={field.name}
                      type="password"
                      required
                      className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </>
                )}
              />
            </div>
            <div>
              <div className="flex w-full space-x-4">
                <div className="w-4/6">
                  <form.Field
                    name="otp"
                    children={(field) => (
                      <>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          OTP
                        </label>
                        <input
                          id={field.name}
                          name={field.name}
                          type="number"
                          required
                          className="mt-2 block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </>
                    )}
                  />
                </div>
                <div className="w-2/6">
                  <button
                    className="mt-8 flex w-full justify-center rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!otpSendMutation.isPending) {
                        otpSendMutation.mutate(emailInput);
                      }
                    }}
                  >
                    {otpSendMutation.isPending ? 'Sending...' : 'Email OTP'}
                  </button>
                </div>
              </div>
              <div
                className={twMerge(
                  'text-sm',
                  otpSendMutation.isPending ? 'opacity-0' : 'opacity-100',
                )}
              >
                <p className={twMerge(otpSendMutation.isPending ? 'opacity-0' : 'hidden')}>
                  Hidden
                </p>
                {otpSendMutation.isSuccess && (
                  <p className="text-green-500">OTP sent to your email successfully</p>
                )}
                {otpSendMutation.isError && (
                  <p className="text-red-500">{otpSendMutation.error.message}</p>
                )}
              </div>
            </div>

            <div className="pt-0">
              <button
                type="submit"
                className="mt-8 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {formSubmitMutation.isPending ? 'Loading...' : 'Sign up'}
              </button>
              {formSubmitMutation.isError && (
                <p className="text-sm text-red-500">{formSubmitMutation.error.message}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
