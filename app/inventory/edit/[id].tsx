// app/inventory/edit/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { InventoryItem } from '../../../types/InventoryItem';

const EditItem = () => {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<InventoryItem | null>(null);

  // Simulate fetching item data from a database (in a real-world app, make an API call)
  useEffect(() => {
    if (id) {
      const itemData: InventoryItem = {
        id: Number(id),
        name: 'Item 1',
        description: 'Updated item description',
        quantity: 100,
        price: 10,
      };
      setItem(itemData);
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated Item:', item);
    router.push('/inventory');
  };

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Edit Item</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
          />
        </label>
        <label>
          Quantity:
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => setItem({ ...item, quantity: Number(e.target.value) })}
          />
        </label>
        <label>
          Price:
          <input
            type="number"
            value={item.price}
            onChange={(e) => setItem({ ...item, price: Number(e.target.value) })}
          />
        </label>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditItem;
