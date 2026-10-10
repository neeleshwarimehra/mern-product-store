
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const initialForm = {
  name: "",
  price: "",
  image: "",
};

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.data || []);
    } catch (error) {
      toast({
        title: "Failed to load products",
        description:
          error.response?.data?.message ||
          "Please check that the backend is running on port 5001.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update form fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Add a new product OR update an existing product
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || form.price === "") {
      toast({
        title: "Please enter the product name and price.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      toast({
        title: "Please enter a valid price.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const productData = {
      name: form.name.trim(),
      price: Number(form.price),
      image: form.image.trim() || "https://placehold.co/400x300",
    };

    try {
      setSaving(true);

      if (editingId) {
        // UPDATE existing product
        await axios.put(
          `${API_URL}/products/${editingId}`,
          productData
        );

        toast({
          title: "Product updated successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // CREATE new product
        await axios.post(`${API_URL}/products`, productData);

        toast({
          title: "Product added successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      setForm(initialForm);
      setEditingId(null);

      await fetchProducts();
    } catch (error) {
      toast({
        title: editingId
          ? "Failed to update product"
          : "Failed to add product",
        description:
          error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Load selected product into the form for editing
  const handleEdit = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      image: product.image || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  // Delete a product
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/products/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      toast({
        title: "Product deleted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchProducts();
    } catch (error) {
      toast({
        title: "Failed to delete product",
        description:
          error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.xl">
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={4}
          mb={8}
        >
          <Box>
            <Heading color="teal.600" size="xl">
              MERN Product Store
            </Heading>

            <Text mt={2} color="gray.600">
              Manage your products with React and MongoDB.
            </Text>
          </Box>

          <Button
            colorScheme="teal"
            variant="outline"
            onClick={fetchProducts}
            isLoading={loading}
          >
            Refresh Products
          </Button>
        </Flex>

        {/* Add / Edit Form */}
        <Box
          bg="white"
          p={{ base: 5, md: 7 }}
          borderRadius="xl"
          boxShadow="md"
          mb={10}
        >
          <Heading size="md" mb={6}>
            {editingId ? "Edit product" : "Add a product"}
          </Heading>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Product Name</FormLabel>

                <Input
                  name="name"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Price (₹)</FormLabel>

                <Input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter product price"
                  value={form.price}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>

                <Input
                  name="image"
                  type="url"
                  placeholder="https://example.com/product.jpg"
                  value={form.image}
                  onChange={handleChange}
                />
              </FormControl>

              <Flex gap={3} wrap="wrap" pt={2}>
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={saving}
                  loadingText={editingId ? "Updating..." : "Adding..."}
                >
                  {editingId ? "Update product" : "Add product"}
                </Button>

                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    isDisabled={saving}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Flex>
            </VStack>
          </form>
        </Box>

        {/* Product List */}
        <Heading size="lg" mb={6}>
          Our Products ({products.length})
        </Heading>

        {loading ? (
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="teal.500" />
          </Flex>
        ) : products.length === 0 ? (
          <Box bg="white" p={10} borderRadius="xl" textAlign="center">
            <Text color="gray.500">
              No products found. Add your first product above.
            </Text>
          </Box>
        ) : (
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            spacing={6}
          >
            {products.map((product) => (
              <Box
                key={product._id}
                bg="white"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="md"
                transition="transform 0.2s"
                _hover={{ transform: "translateY(-4px)" }}
              >
                <Image
                  src={product.image || "https://placehold.co/400x300"}
                  alt={product.name}
                  w="100%"
                  h="200px"
                  objectFit="cover"
                  fallbackSrc="https://placehold.co/400x300?text=Product"
                />

                <VStack align="stretch" spacing={3} p={5}>
                  <Heading size="md" noOfLines={2}>
                    {product.name}
                  </Heading>

                  <Text fontSize="xl" fontWeight="bold" color="teal.600">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </Text>

                  <Flex gap={3}>
                    <Button
                      flex="1"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>

                    <Button
                      flex="1"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}

export default App;
