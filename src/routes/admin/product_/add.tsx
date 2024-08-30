import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Cookies from 'js-cookie';
import { useRef } from 'react';
import ImageCrop from '../../../components/ImageCrop';
import { NamedBlob } from '../../../types/global.type';
import { axiosInstance } from '../../../utils/axios';

export const Route = createFileRoute('/admin/product/add')({
  component: ProductAddComponent,
});

function ProductAddComponent() {
  const navigate = useNavigate({ from: '/admin/product/add' });

  const blobs = useRef([] as NamedBlob[]);

  const token = Cookies.get('token');

  const formSubmitMutation = useMutation({
    mutationFn: (formData: {
      name: string;
      category: string;
      price: number;
      description: string;
    }) => {
      return axiosInstance.post('/admin/add-product', formData);
    },
    onError: (error) => {
      error.message = error.response?.data?.message || error.message;
    },
  });
  const form = useForm({
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      description: '',
    },
    onSubmit: async ({ value }) => {
      const formSubmitted = await formSubmitMutation.mutateAsync(value);
      if (formSubmitted && blobs.current.length) {
        const productId = formSubmitted.data._id;
        try {
          // #upload image
          const bodyFormData = new FormData();
          blobs.current.forEach((blob, index) => {
            const croppedImgFile = new File([blob], blob.name || `image_${index}`, {
              type: blob.type,
            });
            bodyFormData.append('files', croppedImgFile); // Use the same key ('files') to append multiple files
          });
          const imageUploaded = await axiosInstance({
            method: 'post',
            url: `/upload-file/image?for=product&id=${productId}`,
            data: bodyFormData,
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            timeout: 0,
          });
          // #insert img reference in user data
          if (imageUploaded) {
            const imgFileNames = imageUploaded.data.filenames;
            if (imgFileNames.length) {
              try {
                await axiosInstance.patch(
                  `/admin/edit-product/${productId}`,
                  {
                    images: imgFileNames,
                  },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                  },
                );
              } catch (err) {
                await axiosInstance.delete('/delete-image', {
                  data: imgFileNames,
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                });
              }
            }
          }
        } finally {
          navigate({ to: '/admin' });
        }
      }
    },
  });

  return (
    <div className="py-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="space-y-12">
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-5">
            <div className="sm:col-span-3">
              <form.Field
                name="name"
                children={(field) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Name
                    </label>
                    <div className="mt-2">
                      <input
                        id={field.name}
                        name={field.name}
                        type="text"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  </>
                )}
              />
            </div>
            <div className="sm:col-span-3">
              <form.Field
                name="category"
                children={(field) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Category
                    </label>
                    <div className="mt-2">
                      <input
                        id={field.name}
                        name={field.name}
                        type="text"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  </>
                )}
              />
            </div>
            <div className="sm:col-span-3">
              <form.Field
                name="price"
                children={(field) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Price
                    </label>
                    <div className="mt-2">
                      <input
                        id={field.name}
                        name={field.name}
                        type="number"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(parseInt(e.target.value))}
                      />
                    </div>
                  </>
                )}
              />
            </div>
            <div className="sm:col-span-3">
              <form.Field
                name="description"
                children={(field) => (
                  <>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Description
                    </label>
                    <div className="mt-2">
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={3}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        // defaultValue={''}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  </>
                )}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Profile photo
            </label>
            <ImageCrop
              getBlob={(blob) => (blobs.current[0] = blob)}
              aspectValue={3 / 4}
              enableInputRequired
            />
            <ImageCrop
              getBlob={(blob) => (blobs.current[1] = blob)}
              aspectValue={3 / 2}
              // enableInputRequired
            />
            <ImageCrop
              getBlob={(blob) => (blobs.current[2] = blob)}
              aspectValue={3 / 2}
              // enableInputRequired
            />
            <ImageCrop
              getBlob={(blob) => (blobs.current[3] = blob)}
              aspectValue={3 / 4}
              // enableInputRequired
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-28 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {isSubmitting ? 'Loading...' : 'Save'}
              </button>
            )}
          />
          {formSubmitMutation.isError && (
            <p className="text-sm text-red-500">{formSubmitMutation?.error?.message}</p>
          )}
        </div>
      </form>
    </div>
  );
}
