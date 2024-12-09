import { XMarkIcon } from '@heroicons/react/24/outline';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { useForm } from '@tanstack/react-form';
import {
  QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { twMerge } from 'tailwind-merge';
import ImageCrop from '../../../components/ImageCrop';
import LoadingSpinner from '../../../components/LoadingSpinner';
import PageLoadingIndicator from '../../../components/PageLoadingIndicator';
import { Product } from '../../../types/global.type';
import { axiosInstance } from '../../../utils/axios';
import stringOps from '../../../utils/stringOps';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});
const productsQueryOptions = (productId: string) => {
  return queryOptions({
    queryKey: ['product', productId, 'edit'],
    queryFn: () =>
      axiosInstance.get(`/user/get-product?id=${productId}`).then((res) => res.data as Product),
    staleTime: 1000 * 60 * 2,
  });
};

export const Route = createFileRoute('/admin/product/edit/$productId')({
  loader: ({ params: { productId } }) =>
    queryClient.ensureQueryData(productsQueryOptions(productId)),
  pendingComponent: PageLoadingIndicator,
  pendingMinMs: 1000,
  component: ProductEditComponent,
});

function ProductEditComponent() {
  const { productId } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: '/admin/product/edit/$productId' });

  const { data: product } = useSuspenseQuery(productsQueryOptions(productId));

  // #input images fn
  const [isImagesEditOpen, setIsImagesEditOpen] = useState(false);
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
  // #input colors fn
  const [colors, setColors] = useState<{ name: string; hex: string }[]>(product.colors);
  const [colorInputValue, setColorInputValue] = useState('#ffffff');
  const handleColorInput = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setColors((prevState) => {
      const newColor = { name: '', hex: colorInputValue };
      // Check if the new hex value already exists in the array
      const isDuplicate = prevState.some((item) => item.hex === newColor.hex);
      if (isDuplicate) return prevState;
      else return [...prevState, newColor];
    });
    event.preventDefault();
  };
  const handleColorInputName = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setColors((prevState) => {
      const updatedObject = { ...prevState[index], name: event.target.value };
      // Check if the new hex value already exists in the array (excluding the current object at the index)
      const isDuplicate = prevState.some(
        (item, i) => item.hex === updatedObject.hex && i !== index,
      );
      if (isDuplicate) return prevState;
      else return prevState.map((item, i) => (i === index ? updatedObject : item));
    });
  };
  const handleRemoveColor = (event: React.MouseEvent<SVGSVGElement, MouseEvent>, index: number) => {
    setColors(colors.filter((_, i) => i !== index));
    event.preventDefault();
  };
  // #suitableFor select fn
  const [suitableForSelectedOptions, setSuitableForSelectedOptions] = useState<string[]>(
    product.suitableFor,
  );
  const handleSuitableForCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSuitableForSelectedOptions((prevState) => {
      if (checked) {
        // Add the option if it's checked and not already in the array
        return [...prevState, name];
      } else {
        // Remove the option if it's unchecked
        return prevState.filter((option) => option !== name);
      }
    });
  };
  // #size select fn
  const [sizesSelectedOptions, setSizesSelectedOptions] = useState<Product['sizes']>(product.sizes);
  const handleSizeCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSizesSelectedOptions((prevState) => ({ ...prevState, [name]: checked }));
  };
  // #highlights list fn
  const [highlightsInputValue, setHighlightsInputValue] = useState('');
  const [highlights, setHighlights] = useState<string[]>(product.highlights);
  const handleHighlightInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHighlightsInputValue(event.target.value);
  };
  const handleHighlightInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && highlightsInputValue.trim() !== '') {
      setHighlights([...highlights, highlightsInputValue.trim()]);
      setHighlightsInputValue(''); // Clear input after adding
      event.preventDefault(); // Prevent form submission or newline
    } else if (event.key === 'Backspace' && highlightsInputValue === '' && highlights.length > 0) {
      setHighlights(highlights.slice(0, -1)); // Remove the last item if input is empty
    }
  };
  const handleRemoveHighlightItem = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    index: number,
  ) => {
    setHighlights(highlights.filter((_, i) => i !== index));
    event.preventDefault();
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
      images?: Product['images'];
    }) => {
      return axiosInstance.patch(`/admin/edit-product/${productId}`, formData);
    },
    onError: (error) => {
      error.message = error.response?.data?.message || error.message;
    },
  });

  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      name: product.name,
      category: product.category,
      price: product.price as string | number,
      description: product.description,
      details: product.details,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      if (isImagesEditOpen && blobs.current.length) {
        // #upload image
        const bodyFormData = new FormData();
        blobs.current.forEach((blob, index) => {
          let croppedImgFile: File;
          if (blob) {
            croppedImgFile = new File([blob], `image_${index}`, {
              type: blob.type,
            });
          } else croppedImgFile = new File([], 'no-image', { type: undefined });
          bodyFormData.append('files', croppedImgFile); // Use the same key ('files') to append multiple files
        });
        try {
          // #delete previous images in db
          product.images &&
            (await Promise.all(
              product.images.map(async (key) => {
                key && (await axiosInstance.delete(`/delete-image?key=${key}`));
              }),
            ));
        } finally {
          try {
            // #upload new images to db
            const imageUploaded = await axiosInstance({
              method: 'post',
              url: `/upload-file/image?for=product&id=${productId}`,
              data: bodyFormData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 0,
            });
            // #insert img reference in product data
            const imgFileKeys = imageUploaded?.data?.filekeys;
            if (imgFileKeys?.length) {
              try {
                const formSubmitted = await formSubmitMutation.mutateAsync({
                  ...value,
                  colors,
                  suitableFor: suitableForSelectedOptions.sort(),
                  sizes: sizesSelectedOptions,
                  highlights: highlights,
                  images: imgFileKeys,
                });
                // #updating queries with new product data and images
                queryClient.invalidateQueries({ queryKey: ['product', productId] });
                queryClient.setQueryData(['products', 'admin'], (oldData: Product[]) =>
                  oldData?.map((prod) =>
                    prod._id === productId ? formSubmitted.data.product : prod,
                  ),
                );

                navigate({ to: '/admin/product/$productId' }).then(() => {
                  queryClient.removeQueries({
                    queryKey: ['product', 'edit'],
                  });
                });
              } catch (err) {
                product.images &&
                  (await Promise.all(
                    product.images.map(async (key) => {
                      key && (await axiosInstance.delete(`/delete-image?key=${key}`));
                    }),
                  ));
              }
            }
          } catch (err) {
            setFormError('Submission failed. Please try again');
          }
        }
      } else {
        const formSubmitted = await formSubmitMutation.mutateAsync({
          ...value,
          colors,
          suitableFor: suitableForSelectedOptions.sort(),
          sizes: sizesSelectedOptions,
          highlights: highlights,
        });
        // #updating queries with new product data
        queryClient.setQueryData(['product', productId], (oldData: Product) => ({
          ...formSubmitted.data.product,
          images: oldData.images,
        }));
        queryClient.setQueryData(['products', 'admin'], (oldData: Product[]) =>
          oldData?.map((prod) => (prod._id === productId ? formSubmitted.data.product : prod)),
        );

        navigate({ to: '/admin/product/$productId' }).then(() => {
          queryClient.removeQueries({
            queryKey: ['product', 'edit'],
          });
        });
      }
    },
  });

  function SuitableForInputCheckboxUI({ value }: { value: string }) {
    return (
      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input
            id={value}
            name={value}
            type="checkbox"
            checked={suitableForSelectedOptions.includes(value)}
            onChange={handleSuitableForCheckboxChange}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-500 dark:bg-gray-700"
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor={value} className="text-black dark:text-gray-100">
            {stringOps.capitalizeFirstWord(value)}
          </label>
        </div>
      </div>
    );
  }
  function SizesInputCheckboxUI({ value }: { value: string }) {
    return (
      <div className="relative flex gap-x-3">
        <div className="flex h-6 items-center">
          <input
            id={value}
            name={value}
            type="checkbox"
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            checked={(sizesSelectedOptions as any)[value]}
            onChange={handleSizeCheckboxChange}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-500 dark:bg-gray-700"
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor={value} className="text-black dark:text-gray-100">
            {stringOps.uppercase(value)}
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="py-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-gray-100">
          Edit Product
        </h2>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="mt-10">
          <div className="grid grid-cols-12 gap-y-8 border-b border-gray-900/5 pb-8 md:gap-x-6 lg:gap-x-8">
            <div className="col-span-12 space-y-8 md:col-span-6">
              {/* name */}
              <div className="space-y-2">
                <form.Field
                  name="name"
                  children={(field) => (
                    <>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium leading-6 text-black dark:text-gray-100"
                      >
                        Name
                        <span className="text-red-400"> *</span>
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type="text"
                        className="w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-500"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </>
                  )}
                />
              </div>
              {/* category */}
              <div className="space-y-2">
                <form.Field
                  name="category"
                  children={(field) => (
                    <>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium leading-6 text-black dark:text-gray-100"
                      >
                        Category
                        <span className="text-red-400"> *</span>
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-500"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </>
                  )}
                />
              </div>
              {/* suitableFor */}
              <fieldset className="space-y-2">
                <label className="text-sm font-medium leading-6 text-black dark:text-gray-100">
                  Suitable for
                  <span className="text-red-400"> *</span>
                </label>
                <div className="flex flex-wrap [&>*]:pr-8">
                  <SuitableForInputCheckboxUI value="children" />
                  <SuitableForInputCheckboxUI value="men" />
                  <SuitableForInputCheckboxUI value="women" />
                </div>
              </fieldset>
              {/* size */}
              <fieldset className="space-y-2">
                <label className="text-sm font-medium leading-6 text-black dark:text-gray-100">
                  Size
                  <span className="text-red-400"> *</span>
                </label>
                <div className="flex flex-wrap [&>*]:pr-5">
                  <SizesInputCheckboxUI value="xxs" />
                  <SizesInputCheckboxUI value="xs" />
                  <SizesInputCheckboxUI value="s" />
                  <SizesInputCheckboxUI value="m" />
                  <SizesInputCheckboxUI value="l" />
                  <SizesInputCheckboxUI value="xl" />
                  <SizesInputCheckboxUI value="2xl" />
                  <SizesInputCheckboxUI value="3xl" />
                </div>
              </fieldset>
              {/* colors */}
              <div className="space-y-2">
                <label
                  htmlFor="colors"
                  className="block text-sm font-medium leading-6 text-black dark:text-gray-100"
                >
                  Colors
                  <span className="text-red-400"> *</span>
                </label>
                <div className="flex flex-row space-x-4">
                  <div className="space-y-1">
                    <HexColorPicker color={colorInputValue} onChange={setColorInputValue} />
                    <button
                      className="inline-flex w-full items-center justify-center space-x-8 rounded-md bg-indigo-600 px-3 py-1 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={handleColorInput}
                    >
                      Select
                    </button>
                  </div>
                  <div className="w-full">
                    <div className="flex min-h-10 flex-wrap gap-2 px-1 py-1">
                      {colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex w-16 flex-col items-center justify-center gap-1"
                        >
                          <div
                            key={index}
                            className="group flex h-10 w-10 items-center justify-center rounded-full border border-black border-opacity-10 font-light"
                            style={{ backgroundColor: color.hex }}
                          >
                            <div className="hidden h-5 w-5 cursor-pointer rounded-full bg-black p-1 opacity-100 group-hover:block">
                              <XMarkIcon
                                onClick={(e) => handleRemoveColor(e, index)}
                                className="text-white"
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            className="w-16 rounded-md border-0 py-0 text-[12px] text-black ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:leading-6 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-500"
                            placeholder="Name"
                            value={color.name || ''}
                            onChange={(e) => handleColorInputName(e, index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 space-y-8 md:col-span-6">
              {/* price */}
              <div className="space-y-2">
                <form.Field
                  name="price"
                  children={(field) => (
                    <>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium leading-6 text-black dark:text-gray-100"
                      >
                        Price
                        <span className="text-red-400"> *</span>
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type="number"
                        className="hide-number-input-arrow w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-500"
                        value={field.state.value.toString().length > 0 ? field.state.value : ''}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value.length > 0 ? parseFloat(e.target.value) : '',
                          )
                        }
                      />
                    </>
                  )}
                />
              </div>
              {/* description */}
              <div className="space-y-2">
                <form.Field
                  name="description"
                  children={(field) => (
                    <>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium leading-6 text-black dark:text-gray-100"
                      >
                        Description
                        <span className="text-red-400"> *</span>
                      </label>
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={3}
                        className="min-h-[100px] w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-500"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </>
                  )}
                />
              </div>
              {/* details */}
              <div className="space-y-2">
                <form.Field
                  name="details"
                  children={(field) => (
                    <>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium leading-6 text-black dark:text-gray-100"
                      >
                        Details
                        <span className="text-red-400"> *</span>
                      </label>
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={3}
                        className="min-h-[100px] w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-500"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </>
                  )}
                />
              </div>
              {/* highlights */}
              <div className="space-y-2">
                <label
                  htmlFor="highlights"
                  className="block text-sm font-medium leading-6 text-black dark:text-gray-100"
                >
                  Highlights
                </label>
                <input
                  id="highlights"
                  type="text"
                  value={highlightsInputValue}
                  onChange={handleHighlightInputChange}
                  onKeyDown={handleHighlightInputKeyDown}
                  placeholder="Type and press Enter"
                  className="w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-500"
                />
                <ul className="list-disc space-y-1 pl-5">
                  {highlights.map((item, index) => (
                    <li key={index} className="">
                      <div className="flex items-center justify-between">
                        <span className="break-all">{item}</span>
                        <button
                          onClick={(e) => handleRemoveHighlightItem(e, index)}
                          className="text-2xl text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-300 dark:hover:text-gray-200"
                        >
                          &times;
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* images */}
          <div className="mt-6 space-y-2">
            <div className="flex flex-row space-x-2">
              <label className="block text-sm font-medium leading-6 text-black dark:text-gray-100">
                Images
              </label>
              <label className="mb-5 inline cursor-pointer items-center">
                <input
                  name="isImageEditOpen"
                  type="checkbox"
                  checked={isImagesEditOpen}
                  onChange={(e) => setIsImagesEditOpen(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer relative h-5 w-9 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700"></div>
              </label>
            </div>
            {isImagesEditOpen && (
              <div className="grid grid-cols-12 gap-y-4 lg:gap-x-8 lg:gap-y-8">
                {selectedImageFiles.map((file, index) => (
                  <div
                    key={index}
                    className="col-span-12 w-full rounded-lg border border-dashed border-gray-900/25 lg:col-span-6 dark:border-gray-100/25"
                  >
                    {!file && (
                      <div className="flex h-full w-full items-center justify-center px-6 py-10">
                        <div>
                          <PhotoIcon
                            aria-hidden="true"
                            className="mx-auto h-12 w-12 text-gray-300"
                          />
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                              htmlFor={`file-upload_${index}`}
                              className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                              <span>
                                Upload {index + 1}
                                {/* IIFE is used, eg: (["a", "b", "c", "d"])[2] //output: "c" */}
                                <sup>{['st', 'nd', 'rd', 'th'][index]}</sup> image
                                {[true, false, false, false][index] && (
                                  <span className="text-red-400"> *</span>
                                )}
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
            )}
          </div>
        </div>
        {/* submit button */}
        <div className="mt-10 flex items-center justify-end gap-x-6">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex min-w-28 items-center justify-center space-x-8 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size={4} styles="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            )}
          />
          {formSubmitMutation.isError && (
            <p className="text-sm text-red-500">{formSubmitMutation?.error?.message}</p>
          )}
          {formError && <p className="text-sm text-red-500">{formError}</p>}
        </div>
      </form>
    </div>
  );
}
