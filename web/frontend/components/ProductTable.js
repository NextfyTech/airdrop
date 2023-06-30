import { DataTable } from '@shopify/polaris';
import { useAppQuery,useAuthenticatedFetch } from '../hooks';

const ProductTable = () => {
  const fetch = useAuthenticatedFetch();
  const {
    data,
  } = useAppQuery({
    url: "/api/products/fetch",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });
  const rows = data.map((product) => ({
    id: product.id,
    title: product.title,
    price: product.variants.edges[0].node.price,
  }));

  const columns = [
    {
      header: 'ID',
      id: 'id',
    },
    {
      header: 'Title',
      id: 'title',
    },
    {
      header: 'Price',
      id: 'price',
    },
  ];

  return (
    <DataTable
      columnContentTypes={['text', 'text', 'numeric']}
      headings={columns.map((column) => column.header)}
      rows={rows}
    />
  );
};

export default ProductTable;
