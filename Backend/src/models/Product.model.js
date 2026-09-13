const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    dressStyle: {
      type: String,
      default: "Casual",
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },

    sizes: {
      "XX-Small": {
        type: Number,
        default: 0,
        min: 0,
      },

      "X-Small": {
        type: Number,
        default: 0,
        min: 0,
      },

      Small: {
        type: Number,
        default: 0,
        min: 0,
      },

      Medium: {
        type: Number,
        default: 0,
        min: 0,
      },

      Large: {
        type: Number,
        default: 0,
        min: 0,
      },

      "X-Large": {
        type: Number,
        default: 0,
        min: 0,
      },

      "XX-Large": {
        type: Number,
        default: 0,
        min: 0,
      },

      "3X-Large": {
        type: Number,
        default: 0,
        min: 0,
      },

      "4X-Large": {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["In Stock", "Out of Stock"],
      default: "In Stock",
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const updateStockFields = function () {
  const update = this.getUpdate() || {};
  const sizes = update.sizes || update.$set?.sizes;

  if (sizes && typeof sizes === "object") {
    const quantity = Object.values(sizes).reduce(
      (total, value) => total + Number(value || 0),
      0,
    );

    if (update.$set) {
      update.$set.quantity = quantity;
      update.$set.status = quantity <= 0 ? "Out of Stock" : "In Stock";
    } else {
      update.quantity = quantity;
      update.status = quantity <= 0 ? "Out of Stock" : "In Stock";
    }
  } else {
    const quantity = update.quantity ?? update.$set?.quantity;
    if (quantity !== undefined) {
      const numericQuantity = Number(quantity);
      if (update.$set) {
        update.$set.quantity = numericQuantity;
        update.$set.status = numericQuantity <= 0 ? "Out of Stock" : "In Stock";
      } else {
        update.quantity = numericQuantity;
        update.status = numericQuantity <= 0 ? "Out of Stock" : "In Stock";
      }
    }
  }

  this.setUpdate(update);
};
productSchema.index({ dressStyle: 1, createdAt: -1 });

productSchema.pre("save", function () {
  if (this.sizes && typeof this.sizes === "object") {
    this.quantity = Object.values(this.sizes).reduce(
      (total, value) => total + Number(value || 0),
      0,
    );
  }

  this.status = this.quantity <= 0 ? "Out of Stock" : "In Stock";
});

productSchema.pre("findOneAndUpdate", updateStockFields);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
