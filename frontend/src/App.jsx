
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
  Select,
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

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  // READ: Fetch all products
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
          "Check your backend connection.",
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

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // CREATE or UPDATE product
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || form.price === "") {
      toast({
        title: "Product name and price are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      toast({
        title: "Enter a valid, non-negative price",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const productData = {
      name: form.name.trim(),
      price,
      image: form.image.trim() || "https://placehold.co/400x300",
    };

    try {
      setSaving(true);

      if (editingId) {
        await axios.put(
          `${API_URL}/products/${editingId}`,
          productData
        );

        toast({
          title: "Product updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post(`${API_URL}/products`, productData);

        toast({
          title: "Product added successfully",
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

  // Load product details into the form
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

  // DELETE product
  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this product?")
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/products/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      toast({
        title: "Product deleted successfully",
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

  // SEARCH and SORT products
  const filteredProducts = products
    .filter((product) =>
      (product.name || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortOrder === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sortOrder === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      return 0;
    });

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
            <Heading size="xl" color="teal.600">
              MERN Product Store
            </Heading>

            <Text color="gray.600" mt={2}>
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

        {/* Products Header */}
        <Flex
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading size="lg">Our Products</Heading>

            <Text color="gray.600" mt={1}>
              Showing {filteredProducts.length} of {products.length} products
            </Text>
          </Box>

          {/* Search and Sort */}
          <Flex
            gap={3}
            direction={{ base: "column", sm: "row" }}
            minW={{ base: "100%", md: "430px" }}
          >
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              bg="white"
              aria-label="Search products by name"
            />

            <Select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              bg="white"
              minW="190px"
              aria-label="Sort products"
            >
              <option value="default">Default order</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </Select>
          </Flex>
        </Flex>

        {/* Product List */}
        {loading ? (
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="teal.500" />
          </Flex>
        ) : filteredProducts.length === 0 ? (
          <Box
            bg="white"
            p={10}
            borderRadius="xl"
            textAlign="center"
            boxShadow="sm"
          >
            <Heading size="md" mb={2}>
              {search ? "No matching products" : "No products yet"}
            </Heading>

            <Text color="gray.500">
              {search
                ? "Try another search term."
                : "Add your first product using the form above."}
            </Text>

            {search && (
              <Button
                mt={4}
                colorScheme="teal"
                variant="outline"
                onClick={() => setSearch("")}
              >
                Clear Search
              </Button>
            )}
          </Box>
        ) : (
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            spacing={6}
          >
            {filteredProducts.map((product) => (
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
