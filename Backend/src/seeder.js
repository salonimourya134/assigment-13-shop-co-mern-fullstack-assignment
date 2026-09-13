const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./models/user.model");
const Category = require("./models/Category.model");
const Product = require("./models/Product.model");
const Review = require("./models/Review.model");

dotenv.config();

const categoriesData = [
  {
    name: "T-Shirts",
    description: "Comfortable and stylish t-shirts",
    image: "",
  },
  {
    name: "Shirts",
    description: "Casual and formal shirts",
    image: "",
  },
  {
    name: "Jeans",
    description: "Stylish jeans for everyday wear",
    image: "",
  },
  {
    name: "Hoodies",
    description: "Comfortable hoodies for casual wear",
    image: "",
  },
  {
    name: "Shorts",
    description: "Comfortable shorts for casual wear",
    image: "",
  },
];

const productsData = [
  {
    name: "T-SHIRT WITH TAPE DETAILS",
    category: "T-Shirts",
    price: 120,
    description:
      "This graphic t-shirt is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.",
    images: [
      "/uploads/image-7.png",
      "/uploads/image-9-(1).png",
      "/uploads/image-1.png",
    ],
    sizes: {
      "XX-Small": 5,
      "X-Small": 5,
      Small: 10,
      Medium: 10,
      Large: 10,
      "X-Large": 5,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },

  {
    name: "SKINNY FIT JEANS",
    category: "Jeans",
    price: 240,
    description:
      "Modern skinny fit denim crafted with flexible stretch cotton for ultimate comfort and all-day style.",
    images: [
      "/uploads/image-8.png",
      "/uploads/image-1.png",
      "/uploads/image-8.png",
    ],
    sizes: {
      "XX-Small": 0,
      "X-Small": 5,
      Small: 10,
      Medium: 10,
      Large: 10,
      "X-Large": 5,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },

  {
    name: "CHECKERED SHIRT",
    category: "Shirts",
    price: 180,
    description:
      "Classic checkered pattern shirt made with premium woven cotton. Perfect for casual and weekend outings.",
    images: [
      "/uploads/image-9.png",
      "/uploads/image-8-(1).png",
      "/uploads/image-9.png",
    ],
    sizes: {
      "XX-Small": 0,
      "X-Small": 5,
      Small: 5,
      Medium: 10,
      Large: 10,
      "X-Large": 5,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },

  {
    name: "SLEEVE STRIPED T-SHIRT",
    category: "T-Shirts",
    price: 130,
    description:
      "Sporty sleeve striped crewneck t-shirt featuring ribbed cuffs and a relaxed fit.",
    images: [
      "/uploads/image-10.png",
      "/uploads/image-7.png",
      "/uploads/image-10.png",
    ],
    sizes: {
      "XX-Small": 5,
      "X-Small": 5,
      Small: 10,
      Medium: 15,
      Large: 15,
      "X-Large": 10,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },

  {
    name: "VERTICAL STRIPED SHIRT",
    category: "Shirts",
    price: 212,
    description:
      "Elevate your look with this vertical striped tailored button-down shirt.",
    images: [
      "/uploads/image-8-(1).png",
      "/uploads/image-9.png",
      "/uploads/image-8-(1).png",
    ],
    sizes: {
      "XX-Small": 0,
      "X-Small": 5,
      Small: 5,
      Medium: 5,
      Large: 5,
      "X-Large": 5,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 5,
    numReviews: 0,
  },

  {
    name: "CLASSIC OXFORD FORMAL SHIRT",
    category: "Shirts",
    price: 190,
    description:
      "Crisp tailored Oxford button-up crafted from breathable cotton.",
    images: [
      "/uploads/image-9.png",
      "/uploads/image-8-(1).png",
      "/uploads/image-9.png",
    ],
    sizes: {
      "XX-Small": 0,
      "X-Small": 0,
      Small: 0,
      Medium: 0,
      Large: 0,
      "X-Large": 0,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },

  {
    name: "SLIM FIT FORMAL JEANS",
    category: "Jeans",
    price: 220,
    description:
      "Refined dark indigo denim tailored for a sleek business casual silhouette.",
    images: [
      "/uploads/image-8.png",
      "/uploads/image-1.png",
      "/uploads/image-8.png",
    ],
    sizes: {
      "XX-Small": 0,
      "X-Small": 5,
      Small: 5,
      Medium: 10,
      Large: 10,
      "X-Large": 5,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },

  {
    name: "COURAGE GRAPHIC T-SHIRT",
    category: "T-Shirts",
    price: 145,
    description:
      "Bold graphic print on heavyweight cotton. Designed to make a statement.",
    images: [
      "/uploads/image-9-(1).png",
      "/uploads/image-1.png",
      "/uploads/image-7.png",
    ],
    sizes: {
      "XX-Small": 5,
      "X-Small": 5,
      Small: 10,
      Medium: 10,
      Large: 10,
      "X-Large": 5,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4,
    numReviews: 0,
  },

  {
    name: "FADED SKINNY JEANS",
    category: "Jeans",
    price: 210,
    description:
      "Vintage wash faded denim with subtle distressing and a tapered leg.",
    images: [
      "/uploads/image-1.png",
      "/uploads/image-8.png",
      "/uploads/image-1.png",
    ],
    sizes: {
      "XX-Small": 0,
      "X-Small": 0,
      Small: 0,
      Medium: 0,
      Large: 0,
      "X-Large": 0,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },

  {
    name: "ONE LIFE GRAPHIC T-SHIRT",
    category: "T-Shirts",
    price: 260,
    description:
      "Iconic streetwear graphic tee with vibrant artwork and a comfortable oversized fit.",
    images: [
      "/uploads/image-1.png",
      "/uploads/image-7.png",
      "/uploads/image-9-(1).png",
    ],
    sizes: {
      "XX-Small": 10,
      "X-Small": 10,
      Small: 10,
      Medium: 15,
      Large: 15,
      "X-Large": 10,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },

  {
    name: "LOOSE FIT BERMUDA SHORTS",
    category: "Shorts",
    price: 80,
    description:
      "Relaxed fit lightweight bermuda shorts featuring deep pockets and an elastic waist.",
    images: [
      "/uploads/image-10-(1).png",
      "/uploads/image-10.png",
      "/uploads/image-10-(1).png",
    ],
    sizes: {
      "XX-Small": 5,
      "X-Small": 5,
      Small: 10,
      Medium: 10,
      Large: 10,
      "X-Large": 10,
      "XX-Large": 5,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 5,
    numReviews: 0,
  },

  {
    name: "PULLOVER HOODIE",
    category: "Hoodies",
    price: 195,
    description:
      "Heavyweight fleece hoodie with kangaroo pocket and double-layered hood.",
    images: [
      "/uploads/image-7.png",
      "/uploads/image-10.png",
      "/uploads/image-1.png",
    ],
    sizes: {
      "XX-Small": 5,
      "X-Small": 5,
      Small: 10,
      Medium: 10,
      Large: 10,
      "X-Large": 10,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },

  {
    name: "ATHLETIC TRAINING TEE",
    category: "T-Shirts",
    price: 90,
    description:
      "Moisture-wicking breathable performance tee designed for intense workouts.",
    images: [
      "/uploads/image-10.png",
      "/uploads/image-7.png",
      "/uploads/image-9-(1).png",
    ],
    sizes: {
      "XX-Small": 0,
      "X-Small": 0,
      Small: 0,
      Medium: 0,
      Large: 0,
      "X-Large": 0,
      "XX-Large": 0,
      "3X-Large": 0,
      "4X-Large": 0,
    },
    rating: 4.5,
    numReviews: 0,
  },
];

const reviewsData = [
  {
    productName: "T-SHIRT WITH TAPE DETAILS",
    name: "Samantha D.",
    rating: 4.5,
    comment:
      "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable.",
    date: "Posted on August 14, 2023",
  },
  {
    productName: "T-SHIRT WITH TAPE DETAILS",
    name: "Alex M.",
    rating: 4,
    comment:
      "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch.",
    date: "Posted on August 15, 2023",
  },
  {
    productName: "SKINNY FIT JEANS",
    name: "Ethan R.",
    rating: 4.5,
    comment:
      "This product is a must-have for anyone who appreciates good design.",
    date: "Posted on August 16, 2023",
  },
  {
    productName: "CHECKERED SHIRT",
    name: "Olivia P.",
    rating: 4,
    comment:
      "As a UI/UX enthusiast, I value simplicity and functionality.",
    date: "Posted on August 17, 2023",
  },
  {
    productName: "VERTICAL STRIPED SHIRT",
    name: "Liam K.",
    rating: 4,
    comment:
      "This shirt is a fusion of comfort and creativity.",
    date: "Posted on August 18, 2023",
  },
  {
    productName: "ONE LIFE GRAPHIC T-SHIRT",
    name: "Ava H.",
    rating: 4.5,
    comment:
      "The intricate details and thoughtful layout make this shirt a conversation starter.",
    date: "Posted on August 19, 2023",
  },
];

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connected successfully.");

    await Review.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log("Old data deleted.");

let adminUser = await User.findOne({
  email: "admin@gmail.com",
});

if (!adminUser) {
  adminUser = await User.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
  });

  console.log("Admin user created.");
} else {
  adminUser.role = "admin";
  adminUser.password = await bcrypt.hash("admin123", 10);
  await adminUser.save();

  console.log("Existing admin updated.");
}

    let reviewUser = await User.findOne({
      email: "review@gmail.com",
    });

    if (!reviewUser) {
      reviewUser = await User.create({
        name: "Review User",
        email: "review@gmail.com",
        password: await bcrypt.hash("review123", 10),
        role: "customer",
      });

      console.log("Review user created.");
    }

    const categoryMap = {};
    for (const categoryData of categoriesData) {
      const category = await Category.create(categoryData);

      categoryMap[category.name] = category._id;
    }
    console.log("Categories created.");

    const productMap = {};
    const styleMap = {
      "T-SHIRT WITH TAPE DETAILS": "Casual",
      "SKINNY FIT JEANS": "Casual",
      "CHECKERED SHIRT": "Casual",
      "SLEEVE STRIPED T-SHIRT": "Casual",
      "VERTICAL STRIPED SHIRT": "Formal",
      "CLASSIC OXFORD FORMAL SHIRT": "Formal",
      "SLIM FIT FORMAL JEANS": "Formal",
      "COURAGE GRAPHIC T-SHIRT": "Party",
      "FADED SKINNY JEANS": "Party",
      "ONE LIFE GRAPHIC T-SHIRT": "Party",
      "LOOSE FIT BERMUDA SHORTS": "Casual",
      "PULLOVER HOODIE": "Casual",
      "ATHLETIC TRAINING TEE": "Gym",
    };

    for (const productData of productsData) {
      const product = await Product.create({
        user: adminUser._id,
        name: productData.name,
        slug: productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),

        images: productData.images,
        description: productData.description,
        price: productData.price,
        category: categoryMap[productData.category],
        dressStyle: styleMap[productData.name] || "Casual",
        sizes: productData.sizes,
        rating: productData.rating,
        numReviews: productData.numReviews,
      });

      productMap[product.name] = product;
      console.log(`Product created: ${product.name}`);
    }

    console.log("Products created.");

    for (const reviewData of reviewsData) {
      const product = productMap[reviewData.productName];

      if (!product) {
        console.log(
          `Product not found for review: ${reviewData.productName}`
        );
        continue;
      }

      await Review.create({
        user: reviewUser._id,
        product: product._id,
        name: reviewData.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        date: reviewData.date,
      });
    }

    console.log("Reviews created.");

    for (const reviewData of reviewsData) {
      const product = productMap[reviewData.productName];

      if (product) {
        const reviewCount = await Review.countDocuments({
          product: product._id,
        });

        product.numReviews = reviewCount;
        await product.save();
      }
    }

    console.log("Product review counts updated.");

    console.log("");
    console.log("==============================");
    console.log("DATABASE SEED COMPLETED");
    console.log("==============================");
    console.log(`Categories : ${await Category.countDocuments()}`);
    console.log(`Products   : ${await Product.countDocuments()}`);
    console.log(`Reviews    : ${await Review.countDocuments()}`);
    console.log("==============================");

    await mongoose.connection.close();
    console.log("MongoDB connection closed.");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
