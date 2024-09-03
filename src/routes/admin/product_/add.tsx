import { XMarkIcon } from '@heroicons/react/24/outline';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import ImageCrop from '../../../components/ImageCrop';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { NamedBlob } from '../../../types/global.type';
import { axiosInstance } from '../../../utils/axios';

export const Route = createFileRoute('/admin/product/add')({
  component: ProductAddComponent,
});

function ProductAddComponent() {
  const navigate = useNavigate({ from: '/admin/product/add' });

  const blobs = useRef<NamedBlob[] | null[]>([null, null, null, null]);
  const [selectedImageFile_0, setSelectedImageFile_0] = useState<File | null>(null);
  const [selectedImageFile_1, setSelectedImageFile_1] = useState<File | null>(null);
  const [selectedImageFile_2, setSelectedImageFile_2] = useState<File | null>(null);
  const [selectedImageFile_3, setSelectedImageFile_3] = useState<File | null>(null);

  // #input chips fn
  const [colorInputValue, setColorInputValue] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const handleColorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorInputValue(event.target.value);
  };
  const removeLastColor = () => {
    setColors(colors.slice(0, -1)); // Remove the last topic from the list
  };
  const handleColorInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      const trimmedValue = colorInputValue.trim();
      if (trimmedValue && !colors.includes(trimmedValue)) {
        setColors([...colors, trimmedValue]);
      }
      setColorInputValue('');
      event.preventDefault(); // Prevent space or Enter from being added to input field
    } else if (event.key === 'Backspace' && colorInputValue === '') {
      removeLastColor();
      event.preventDefault(); // Prevent default backspace behavior
    }
  };
  const handleRemoveColor = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    topicToRemove: string,
  ) => {
    setColors(colors.filter((topic) => topic !== topicToRemove));
    event.preventDefault();
  };
  // #/input chips fn
  // #suitableFor select fn
  const [suitableForSelectedOptions, setSuitableForSelectedOptions] = useState<string[]>([]);
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
  // #/suitableFor select fn
  // #size select fn
  const [sizeSelectedOptions, setSizeSelectedOptions] = useState<string[]>([]);
  const handleSizeCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSizeSelectedOptions((prevState) => {
      if (checked) {
        // Add the option if it's checked and not already in the array
        return [...prevState, name];
      } else {
        // Remove the option if it's unchecked
        return prevState.filter((option) => option !== name);
      }
    });
  };
  // #/size select fn
  // #highlights list fn
  const [highlightsInputValue, setHighlightsInputValue] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
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
  // #/highlights list fn

  const formSubmitMutation = useMutation({
    mutationFn: (formData: {
      name: string;
      category: string;
      price: string | number;
      description: string;
      details: string;
      color: string[];
      suitableFor: string[];
      size: string[];
      highlights: string[];
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
      price: '' as string | number,
      description: '',
      details: '',
    },
    onSubmit: async ({ value }) => {
      const formSubmitted = await formSubmitMutation.mutateAsync({
        ...value,
        color: colors,
        suitableFor: suitableForSelectedOptions,
        size: sizeSelectedOptions,
        highlights: highlights,
      });
      if (formSubmitted && blobs.current.length) {
        const productId = formSubmitted.data.product._id;
        try {
          // #upload image
          const bodyFormData = new FormData();
          blobs.current.forEach((blob, index) => {
            let croppedImgFile: File;
            if (blob) {
              croppedImgFile = new File([blob], blob.name || `image_${index}.png`, {
                type: blob.type,
              });
            } else croppedImgFile = new File([], 'no-image', { type: undefined });
            bodyFormData.append('files', croppedImgFile); // Use the same key ('files') to append multiple files
          });
          const imageUploaded = await axiosInstance({
            method: 'post',
            url: `/upload-file/image?for=product&id=${productId}`,
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
                await axiosInstance.patch(`/admin/edit-product/${productId}`, {
                  images: imgFileNames,
                });
              } catch (err) {
                await axiosInstance.delete('/delete-image', {
                  data: imgFileNames,
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black">Add Product</h2>
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
                        className="block text-sm font-medium leading-6 text-black"
                      >
                        Name
                        <span className="text-red-400"> *</span>
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type="text"
                        required
                        className="w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                        className="block text-sm font-medium leading-6 text-black"
                      >
                        Category
                        <span className="text-red-400"> *</span>
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type="text"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </>
                  )}
                />
              </div>
              {/* price */}
              <div className="space-y-2">
                <form.Field
                  name="price"
                  children={(field) => (
                    <>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium leading-6 text-black"
                      >
                        Price
                        <span className="text-red-400"> *</span>
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type="number"
                        required
                        className="hide-number-input-arrow w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
              {/* suitableFor */}
              <fieldset className="space-y-2">
                <label className="text-sm font-medium leading-6 text-black">
                  Suitable for
                  <span className="text-red-400"> *</span>
                </label>
                <div className="flex flex-wrap [&>*]:pr-8">
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="children"
                        name="children"
                        type="checkbox"
                        checked={suitableForSelectedOptions.includes('children')}
                        onChange={handleSuitableForCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="children" className="text-black">
                        Children
                      </label>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="men"
                        name="men"
                        type="checkbox"
                        checked={suitableForSelectedOptions.includes('men')}
                        onChange={handleSuitableForCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="men" className="text-black">
                        Men
                      </label>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="women"
                        name="women"
                        type="checkbox"
                        checked={suitableForSelectedOptions.includes('women')}
                        onChange={handleSuitableForCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="women" className="text-black">
                        Women
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
              {/* size */}
              <fieldset className="space-y-2">
                <label className="text-sm font-medium leading-6 text-black">
                  Size
                  <span className="text-red-400"> *</span>
                </label>
                <div className="flex flex-wrap [&>*]:pr-5">
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="xxs"
                        name="xxs"
                        type="checkbox"
                        checked={sizeSelectedOptions.includes('xxs')}
                        onChange={handleSizeCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="xxs" className="text-black">
                        XXS
                      </label>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="xs"
                        name="xs"
                        type="checkbox"
                        checked={sizeSelectedOptions.includes('xs')}
                        onChange={handleSizeCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="xs" className="text-black">
                        XS
                      </label>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="s"
                        name="s"
                        type="checkbox"
                        checked={sizeSelectedOptions.includes('s')}
                        onChange={handleSizeCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="s" className="text-black">
                        S
                      </label>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="m"
                        name="m"
                        type="checkbox"
                        checked={sizeSelectedOptions.includes('m')}
                        onChange={handleSizeCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="m" className="text-black">
                        M
                      </label>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="l"
                        name="l"
                        type="checkbox"
                        checked={sizeSelectedOptions.includes('l')}
                        onChange={handleSizeCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="l" className="text-black">
                        L
                      </label>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="xl"
                        name="xl"
                        type="checkbox"
                        checked={sizeSelectedOptions.includes('xl')}
                        onChange={handleSizeCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="xl" className="text-black">
                        XL
                      </label>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="2xl"
                        name="2xl"
                        type="checkbox"
                        checked={sizeSelectedOptions.includes('2xl')}
                        onChange={handleSizeCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="2xl" className="text-black">
                        2XL
                      </label>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="3xl"
                        name="3xl"
                        type="checkbox"
                        checked={sizeSelectedOptions.includes('3xl')}
                        onChange={handleSizeCheckboxChange}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="3xl" className="text-black">
                        3XL
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="col-span-12 space-y-8 md:col-span-6">
              {/* colors */}
              <div className="space-y-2">
                <label htmlFor="colors" className="block text-sm font-medium leading-6 text-black">
                  Colors
                  <span className="text-red-400"> *</span>
                </label>
                <div className="flex w-full flex-wrap gap-2 rounded-md px-1 py-1 text-sm text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600">
                  {colors.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center rounded-full bg-gray-200 px-3 py-[4px] font-light"
                    >
                      {topic}
                      <button
                        onClick={(e) => handleRemoveColor(e, topic)}
                        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <input
                    id="colors"
                    type="text"
                    value={colorInputValue}
                    onChange={handleColorInputChange}
                    onKeyDown={handleColorInputKeyDown}
                    placeholder="Type and press space/enter"
                    className="w-5/6 rounded-md border-0 py-0.5 text-sm text-black ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:leading-6 lg:w-1/2 xl:w-2/5"
                  />
                </div>
              </div>
              {/* description */}
              <div className="space-y-2">
                <form.Field
                  name="description"
                  children={(field) => (
                    <>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium leading-6 text-black"
                      >
                        Description
                        <span className="text-red-400"> *</span>
                      </label>
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={3}
                        required
                        className="min-h-[100px] w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                        className="block text-sm font-medium leading-6 text-black"
                      >
                        Details
                        <span className="text-red-400"> *</span>
                      </label>
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={3}
                        required
                        className="min-h-[100px] w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  className="block text-sm font-medium leading-6 text-black"
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
                  className="w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <ul className="list-disc space-y-1 pl-5">
                  {highlights.map((item, index) => (
                    <li key={index} className="">
                      <div className="flex items-center justify-between">
                        <span className="break-all">{item}</span>
                        <button
                          onClick={(e) => handleRemoveHighlightItem(e, index)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
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
            <label className="block text-sm font-medium leading-6 text-black">
              Images
              <span className="text-red-400"> *</span>
            </label>
            <div className="grid grid-cols-12 gap-y-4 lg:gap-x-8 lg:gap-y-8">
              <div className="col-span-12 w-full rounded-lg border border-dashed border-gray-900/25 lg:col-span-6">
                {!selectedImageFile_0 && (
                  <div className="flex h-full w-full items-center justify-center px-6 py-10">
                    <div>
                      <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload_0"
                          className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>
                            Upload 1<sup>st</sup> image
                            <span className="text-red-400"> *</span>
                          </span>
                          <input
                            id="file-upload_0"
                            name="file-upload_0"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            required
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setSelectedImageFile_0(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                <>
                  {selectedImageFile_0 && (
                    <div className="relative">
                      <div className="absolute right-1 top-1 z-50 flex aspect-square w-7 items-center justify-center rounded-full border-2 border-black/60 bg-white/60 hover:bg-white/100">
                        <XMarkIcon
                          className="w-5 cursor-pointer text-black"
                          onClick={() => {
                            setSelectedImageFile_0(null);
                            blobs.current[0] = null;
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={twMerge(
                      'flex h-full items-center justify-center',
                      selectedImageFile_0 ? 'flex' : 'hidden',
                    )}
                  >
                    <ImageCrop
                      getBlob={(blob) => (blobs.current[0] = blob)}
                      aspectValue={3 / 4}
                      selectedFile={selectedImageFile_0}
                    />
                  </div>
                </>
              </div>
              <div className="col-span-12 w-full rounded-lg border border-dashed border-gray-900/25 lg:col-span-6">
                {!selectedImageFile_1 && (
                  <div className="flex h-full w-full items-center justify-center px-6 py-10">
                    <div>
                      <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload_1"
                          className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>
                            Upload 2<sup>nd</sup> image
                          </span>
                          <input
                            id="file-upload_1"
                            name="file-upload_1"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setSelectedImageFile_1(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                <>
                  {selectedImageFile_1 && (
                    <div className="relative">
                      <div className="absolute right-1 top-1 z-50 flex aspect-square w-7 items-center justify-center rounded-full border-2 border-black/60 bg-white/60 hover:bg-white/100">
                        <XMarkIcon
                          className="w-5 cursor-pointer text-black"
                          onClick={() => {
                            setSelectedImageFile_1(null);
                            blobs.current[1] = null;
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={twMerge(
                      'flex h-full items-center justify-center',
                      selectedImageFile_1 ? 'flex' : 'hidden',
                    )}
                  >
                    <ImageCrop
                      getBlob={(blob) => (blobs.current[1] = blob)}
                      aspectValue={3 / 2}
                      selectedFile={selectedImageFile_1}
                    />
                  </div>
                </>
              </div>
              <div className="col-span-12 w-full rounded-lg border border-dashed border-gray-900/25 lg:col-span-6">
                {!selectedImageFile_2 && (
                  <div className="flex h-full w-full items-center justify-center px-6 py-10">
                    <div>
                      <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload_2"
                          className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>
                            Upload 3<sup>rd</sup> image
                          </span>
                          <input
                            id="file-upload_2"
                            name="file-upload_2"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setSelectedImageFile_2(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                <>
                  {selectedImageFile_2 && (
                    <div className="relative">
                      <div className="absolute right-1 top-1 z-50 flex aspect-square w-7 items-center justify-center rounded-full border-2 border-black/60 bg-white/60 hover:bg-white/100">
                        <XMarkIcon
                          className="w-5 cursor-pointer text-black"
                          onClick={() => {
                            setSelectedImageFile_2(null);
                            blobs.current[2] = null;
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={twMerge(
                      'flex h-full items-center justify-center',
                      selectedImageFile_2 ? 'flex' : 'hidden',
                    )}
                  >
                    <ImageCrop
                      getBlob={(blob) => (blobs.current[2] = blob)}
                      aspectValue={3 / 2}
                      selectedFile={selectedImageFile_2}
                    />
                  </div>
                </>
              </div>
              <div className="col-span-12 w-full rounded-lg border border-dashed border-gray-900/25 lg:col-span-6">
                {!selectedImageFile_3 && (
                  <div className="flex h-full w-full items-center justify-center px-6 py-10">
                    <div>
                      <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload_3"
                          className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span>
                            Upload 4<sup>th</sup> image
                          </span>
                          <input
                            id="file-upload_3"
                            name="file-upload_3"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setSelectedImageFile_3(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                <>
                  {selectedImageFile_3 && (
                    <div className="relative">
                      <div className="absolute right-1 top-1 z-50 flex aspect-square w-7 items-center justify-center rounded-full border-2 border-black/60 bg-white/60 hover:bg-white/100">
                        <XMarkIcon
                          className="w-5 cursor-pointer text-black"
                          onClick={() => {
                            setSelectedImageFile_3(null);
                            blobs.current[3] = null;
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={twMerge(
                      'flex h-full items-center justify-center',
                      selectedImageFile_3 ? 'flex' : 'hidden',
                    )}
                  >
                    <ImageCrop
                      getBlob={(blob) => (blobs.current[3] = blob)}
                      aspectValue={3 / 4}
                      selectedFile={selectedImageFile_3}
                    />
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>

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
                  'Add'
                )}
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
