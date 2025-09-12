import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector, setLoading, setError } from '../lib/redux/hooks/typedHooks';
import { setProducts } from '../lib/redux/features/products/productSlice';
import {
  useGetAllProductsQuery
} from '../lib/redux/features/clients/clientupdatedApiSlice';

export default function Products() {
    const { 
    data,
    isLoading, 
    error,
  } = useGetAllProductsQuery();
    const dispatch = useDispatch();
    // console.log('products-----',data)
    const products = useAppSelector((state) => state.products);
// const products = useAppSelector((state: RootState) => state.items)
useEffect(() => {
    if (data) {
      dispatch(setProducts(data));

    //   console.log('')
    }
  }, [data, dispatch]);
     

//   console.log('productsDataStateproductsDataState',products)

  return (
    <div>Products

        {
            products.items.map( item => (
                <div key={item.id}>{item.name}</div>
            ))
        }
    </div>
  )
}
