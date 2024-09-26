import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Cookies from 'js-cookie';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import ImageCrop from '../../components/ImageCrop';
import { axiosInstance } from '../../utils/axios';

export const Route = createFileRoute('/_auth/signup')({
  component: SignupComponent,
});

function SignupComponent() {
  const navigate = useNavigate({ from: '/signup' });

  const [emailInput, setEmailInput] = useState('');
  const blobs = useRef<Blob | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const otpSendMutation = useMutation({
    mutationFn: (email: string) => {
      return axiosInstance.post('/auth/send-otp', { email }, { timeout: 0 });
    },
    onError: (error) => {
      error.message = error.response?.data?.message || error.message;
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
    onError: async (error) => {
      error.message = error.response?.data?.message || error.message;
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
      const formSubmitted = await formSubmitMutation.mutateAsync(value);
      if (formSubmitted && blobs.current) {
        const userId = formSubmitted.data.user._id;
        const token = formSubmitted.data.token;
        // #set authorization (Bearer token) for axios requests
        axiosInstance.interceptors.request.use(
          function (config) {
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
          },
          function (error) {
            return Promise.reject(error);
          },
        );
        try {
          // #upload image
          const blobFile = blobs.current;
          const bodyFormData = new FormData();
          const croppedImgFile = new File([blobFile], `image_${0}`, {
            type: blobFile.type,
          });
          bodyFormData.append('files', croppedImgFile); // Use the same key ('files') to append multiple files
          const imageUploaded = await axiosInstance({
            method: 'post',
            url: `/upload-file/image?for=user&id=${userId}`,
            data: bodyFormData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 0,
          });
          // #insert img reference in user data
          if (imageUploaded) {
            const imgFileNames = imageUploaded.data.filenames;
            if (imgFileNames.length) {
              try {
                await axiosInstance.patch(`/user/update-details/${userId}`, {
                  image: imgFileNames[0],
                });
              } catch (err) {
                await axiosInstance.delete(`/delete-image`, {
                  data: imgFileNames,
                });
              }
            }
          }
        } finally {
          Cookies.set('token', token, { expires: 1, secure: true });
          navigate({ to: '/' });
        }
      }
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
            <div className="space-y-2">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Profile photo
              </label>
              <div className="col-span-12 w-full rounded-lg border border-dashed border-gray-900/25 lg:col-span-6">
                {!selectedImageFile && (
                  <div className="flex h-full w-full items-center justify-center px-6 py-5">
                    <div>
                      <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload_3"
                          className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>Add profile photo</span>
                          <input
                            id="file-upload_3"
                            name="file-upload_3"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            required
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setSelectedImageFile(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                <>
                  {selectedImageFile && (
                    <div className="relative">
                      <div className="absolute right-1 top-1 z-50 flex aspect-square w-7 items-center justify-center rounded-full border-2 border-black/60 bg-white/60 hover:bg-white/100">
                        <XMarkIcon
                          className="w-5 cursor-pointer text-black"
                          onClick={() => {
                            setSelectedImageFile(null);
                            blobs.current = null;
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={twMerge(
                      'flex h-full items-center justify-center',
                      selectedImageFile ? 'flex' : 'hidden',
                    )}
                  >
                    <ImageCrop
                      getBlob={(blob) => (blobs.current = blob)}
                      aspectValue={1 / 1}
                      selectedFile={selectedImageFile}
                      enableCircularCrop
                    />
                  </div>
                </>
              </div>
            </div>
            <div>
              <form.Field
                name="otp"
                children={(field) => (
                  <div className="w-full">
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      OTP
                    </label>
                    <div className="mt-2 flex space-x-4">
                      <div className="w-2/6">
                        <button
                          className="flex w-full justify-center rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!otpSendMutation.isPending) {
                              otpSendMutation.mutate(emailInput);
                            }
                          }}
                        >
                          {otpSendMutation.isPending ? 'Sending...' : 'Send OTP'}
                        </button>
                      </div>
                      <div className="w-4/6">
                        <input
                          id={field.name}
                          name={field.name}
                          type="number"
                          required
                          className="block w-full rounded-md border-0 px-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter OTP here"
                        />
                      </div>
                    </div>
                  </div>
                )}
              />
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
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-8 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {isSubmitting ? 'Loading...' : 'Sign up'}
                  </button>
                )}
              />
              {formSubmitMutation.isError && (
                <p className="text-sm text-red-500">{formSubmitMutation?.error?.message}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
