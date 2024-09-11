import { XMarkIcon } from '@heroicons/react/24/outline';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import ImageCrop from '../../../components/ImageCrop';
import { Product } from '../../../types/global.type';
import { axiosInstance } from '../../../utils/axios';

export const Route = createFileRoute('/admin/product/edit/$productId')({
  component: ProductEditComponent,
});

function ProductEditComponent() {
  const { productId } = Route.useParams();
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading: isProductFetchLoading,
    isError: isProductFetchError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      const cachedProducts: Product[] | undefined = queryClient.getQueryData(['admin-products']);
      const cachedProductData =
        cachedProducts?.find((prod) => prod._id === productId) ||
        queryClient.getQueryData(['product', productId]);
      if (cachedProductData) return cachedProductData;
      else return axiosInstance.get(`/admin/get-product?id=${productId}`).then((res) => res.data);
    },
  });
  // console.log({ product, isProductFetchLoading, isProductFetchError });

  // #input images fn
  const [selectedImageFiles, setSelectedImageFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const blobs = useRef<Blob[] | null[]>([null, null, null, null]);
  const handleSelectedImageFiles = (file: File | null, index: number) => {
    if (file === null) blobs.current[index] = null;
    setSelectedImageFiles((prevState) => prevState.map((item, i) => (i === index ? file : item)));
  };

  const formSubmitMutation = useMutation({
    mutationFn: (formData: {
      name?: Product['name'];
      category?: Product['category'];
      price?: Product['price'] | string;
      description?: Product['description'];
      details?: Product['details'];
      colors?: Product['colors'];
      suitableFor?: Product['suitableFor'];
      sizes?: Product['sizes'];
      highlights?: Product['highlights'];
    }) => {
      return axiosInstance.patch(`/admin/edit-product/${productId}`, formData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-products'], (oldData: Product[]) =>
        oldData?.map((prod: Product) => (prod._id === productId ? data.data : prod)),
      );
    },
    onError: (error) => {
      error.message = error.response?.data?.message || error.message;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });

  const handleSubmit = () => {
    formSubmitMutation.mutate({ name: 'one1' });
  };

  return (
    <>
      <button onClick={handleSubmit}>Click</button>
      {!isProductFetchError && !isProductFetchLoading && <h1>{product.name}</h1>}
      {/* images */}
      <div className="mt-6 space-y-2">
        <label className="block text-sm font-medium leading-6 text-black">
          Images
          <span className="text-red-400"> *</span>
        </label>
        <div className="grid grid-cols-12 gap-y-4 lg:gap-x-8 lg:gap-y-8">
          {selectedImageFiles.map((file, index) => (
            <div
              key={index}
              className="col-span-12 w-full rounded-lg border border-dashed border-gray-900/25 lg:col-span-6"
            >
              {!file && (
                <div className="flex h-full w-full items-center justify-center px-6 py-10">
                  <div>
                    <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor={`file-upload_${index}`}
                        className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>
                          Upload {index + 1}
                          {/* IIFE is used, eg: (["a", "b", "c", "d"])[2] //output: "c" */}
                          <sup>{['st', 'nd', 'rd', 'th'][index]}</sup> image
                        </span>
                        <input
                          id={`file-upload_${index}`}
                          name={`file-upload_${index}`}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          // IIFE is used, eg: (["a", "b", "c", "d"])[2] //output: "c"
                          required={[true, false, false, false][index]}
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleSelectedImageFiles(e.target.files[0], index);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
              <>
                {!!file && (
                  <div className="relative">
                    <div className="absolute right-1 top-1 z-50 flex aspect-square w-7 items-center justify-center rounded-full border-2 border-black/60 bg-white/60 hover:bg-white/100">
                      <XMarkIcon
                        className="w-5 cursor-pointer text-black"
                        onClick={() => {
                          handleSelectedImageFiles(null, index);
                        }}
                      />
                    </div>
                  </div>
                )}
                <div
                  className={twMerge(
                    'flex h-full items-center justify-center',
                    file ? 'flex' : 'hidden',
                  )}
                >
                  <ImageCrop
                    getBlob={(blob) => {
                      blobs.current[index] = blob;
                    }}
                    // IIFE is used, eg: (["a", "b", "c", "d"])[2] //output: "c"
                    aspectValue={[3 / 4, 3 / 2, 3 / 2, 3 / 4][index]}
                    selectedFile={file}
                  />
                </div>
              </>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
