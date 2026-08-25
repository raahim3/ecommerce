import headphones from "@/assets/p-headphones.jpg";
import watch from "@/assets/p-watch.jpg";
import knit from "@/assets/p-knit.jpg";
import sneaker from "@/assets/p-sneaker.jpg";
import bag from "@/assets/p-bag.jpg";
import lamp from "@/assets/p-lamp.jpg";
import scent from "@/assets/p-scent.jpg";
import sunglasses from "@/assets/p-sunglasses.jpg";

import catFashion from "@/assets/cat-fashion.jpg";
import catElectronics from "@/assets/cat-electronics.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catHome from "@/assets/cat-home.jpg";
import editorialImg from "@/assets/editorial.jpg";
import heroImg from "@/assets/hero.jpg";

export const categories = [];
export const products = [];

export const filters = ["All", "Fashion", "Electronics", "Accessories", "Lifestyle"];

export const sortOptions = [
  { id: "featured", label: "Featured & Popular" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating-desc", label: "Highest Rated" },
  { id: "reviews-desc", label: "Most Reviewed" },
  { id: "name-asc", label: "Name: A to Z" },
];

export const testimonials = [
  {
    quote:
      "The quality is incredible and the entire shopping experience feels premium — from the packaging to the follow-up.",
    name: "Amara Osei",
    role: "Verified Customer",
  },
  {
    quote:
      "I've replaced half my wardrobe with pieces from here. Everything arrives fast and looks better in person.",
    name: "Julian Reyes",
    role: "Verified Customer",
  },
  {
    quote:
      "Finally a store that curates instead of overwhelming. The returns process took me under two minutes.",
    name: "Sofia Lindqvist",
    role: "Verified Customer",
  },
];

export const socialImages = [
  { src: catFashion, alt: "Model in tailored black outfit walking in the city" },
  { src: knit, alt: "Folded cream cashmere knit" },
  { src: catHome, alt: "Ceramic vases on an oak shelf" },
  { src: sneaker, alt: "White leather sneakers in sunlight" },
  { src: catAccessories, alt: "Leather belt, watch and gold jewellery" },
  { src: scent, alt: "Reed diffuser in warm daylight" },
];

const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", SEK: "kr" };

export const getCurrencySymbol = (currency = globalThis.__STORE_CURRENCY__) => {
  const code = String(currency || "USD").split(" ")[0].toUpperCase();
  return CURRENCY_SYMBOLS[code] || code;
};

export const formatPrice = (value, decimals = 0) => `${getCurrencySymbol()}${Number(value).toFixed(decimals)}`;
