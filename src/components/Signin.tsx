import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import Cookies from 'js-cookie';
import { axiosInstance } from '../utils/axios';

export default function Signin() {
  const navigate = useNavigate({ from: '/signin' });

  const mutation = useMutation({
    mutationFn: (formData: { email: string; password: string }) => {
      return axiosInstance.post('/auth/signin', formData);
    },
    onError: (error) => {
      // console.log({ error, variables, context });
      error.message = error.response.data.message || error.message;
    },
    onSuccess: (data) => {
      // console.log({ data, variables, context });
      Cookies.set('token', data.data.token, { expires: 7, secure: true });
      if (data.data.user.role === 'admin') navigate({ to: '/admin' });
      else navigate({ to: '/' });
    },
  });
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
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
                    onChange={(e) => field.handleChange(e.target.value)}
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
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="password"
                    required
                    autoComplete="current-password"
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
            <button
              type="submit"
              className="mt-8 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {mutation.isPending ? 'Loading...' : 'Sign in'}
            </button>
            {mutation.isError ? (
              <p className="text-sm text-red-500">{mutation.error.message}</p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
