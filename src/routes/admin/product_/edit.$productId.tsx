import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
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
    </>
  );
}
