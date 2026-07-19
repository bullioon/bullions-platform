"use client";

import { useEffect, useState } from "react";

import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";
import type {
  ProductBilling,
  ProductType,
  StrategyProduct,
} from "@/types/v2/product";
import { useStudio } from "./StudioContext";

type CategoryOption = {
  value: ProductType;
  icon: string;
  subtitle: string;
};

const categories: CategoryOption[] = [
  {
    value: "Research",
    icon: "R",
    subtitle: "Reports and theses",
  },
  {
    value: "AI",
    icon: "AI",
    subtitle: "Agents and intelligence",
  },
  {
    value: "Signals",
    icon: "S",
    subtitle: "Trading alerts",
  },
  {
    value: "Trading Bot",
    icon: "BOT",
    subtitle: "MT5, Pine or API",
  },
  {
    value: "Indicator",
    icon: "IND",
    subtitle: "Market indicators",
  },
  {
    value: "Strategy",
    icon: "STR",
    subtitle: "Investment systems",
  },
  {
    value: "Course",
    icon: "EDU",
    subtitle: "Education and training",
  },
  {
    value: "Community",
    icon: "COM",
    subtitle: "Private membership",
  },
  {
    value: "Mentorship",
    icon: "1:1",
    subtitle: "Direct guidance",
  },
  {
    value: "Software",
    icon: "SW",
    subtitle: "Trading software",
  },
  {
    value: "API",
    icon: "API",
    subtitle: "Developer access",
  },
  {
    value: "Tool",
    icon: "TOOL",
    subtitle: "Utilities and analytics",
  },
];

export function ProductsEditor() {
  const { state } = useStudio();

  const [products, setProducts] = useState<StrategyProduct[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [type, setType] = useState<ProductType>("Research");
  const [billing, setBilling] =
    useState<ProductBilling>("monthly");
  const [accessUrl, setAccessUrl] = useState("");
  const [active, setActive] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadProducts() {
      if (!state.uid) {
        setLoading(false);
        return;
      }

      try {
        const manager =
          await ManagerRepository.get(state.uid);

        if (!alive) return;

        setProducts(
          (manager?.social?.products ?? []).map(
            (product) => ({
              ...product,
              type: product.type || "Research",
              billing: product.billing || "monthly",
              createdAt:
                product.createdAt || Date.now(),
            })
          )
        );
      } catch (error) {
        if (!alive) return;

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load products."
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      alive = false;
    };
  }, [state.uid]);

  async function persist(
    nextProducts: StrategyProduct[]
  ) {
    if (!state.uid) {
      throw new Error("Login required.");
    }

    await ManagerRepository.updateSocial(
      state.uid,
      {
        products: nextProducts,
      }
    );
  }

  async function createProduct() {
    const cleanTitle = title.trim();
    const cleanDescription =
      description.trim();
    const cleanUrl = accessUrl.trim();
    const price = Number(priceUsd || 0);

    if (!cleanTitle) {
      setMessage("Product title is required.");
      return;
    }

    if (!cleanDescription) {
      setMessage(
        "Product description is required."
      );
      return;
    }

    if (
      billing !== "free" &&
      (!Number.isFinite(price) || price < 0)
    ) {
      setMessage("Enter a valid price.");
      return;
    }

    if (cleanUrl) {
      try {
        new URL(cleanUrl);
      } catch {
        setMessage(
          "Access URL must begin with https://"
        );
        return;
      }
    }

    setSaving(true);
    setMessage("");

    const id =
      typeof crypto !== "undefined" &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const product: StrategyProduct = {
      id,
      title: cleanTitle,
      description: cleanDescription,
      type,
      billing,
      priceUsd:
        billing === "free" ? 0 : price,
      subscribers: 0,
      active,
      accessUrl: cleanUrl || undefined,
      createdAt: Date.now(),
    };

    const nextProducts = [
      product,
      ...products,
    ];

    try {
      await persist(nextProducts);

      setProducts(nextProducts);
      setTitle("");
      setDescription("");
      setPriceUsd("");
      setAccessUrl("");
      setType("Research");
      setBilling("monthly");
      setActive(false);
      setMessage("Product created.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not create product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleProduct(
    productId: string
  ) {
    const previousProducts = products;

    const nextProducts = products.map(
      (product) =>
        product.id === productId
          ? {
              ...product,
              active: !product.active,
            }
          : product
    );

    setProducts(nextProducts);

    try {
      await persist(nextProducts);
      setMessage("Product status updated.");
    } catch (error) {
      setProducts(previousProducts);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update product."
      );
    }
  }

  async function removeProduct(
    productId: string
  ) {
    const previousProducts = products;

    const nextProducts = products.filter(
      (product) => product.id !== productId
    );

    setProducts(nextProducts);

    try {
      await persist(nextProducts);
      setMessage("Product removed.");
    } catch (error) {
      setProducts(previousProducts);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not remove product."
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 p-10 text-white/40">
        Loading marketplace...
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="rounded-[28px] border border-white/10 bg-black/20 p-6">
        <p className="text-xl font-black text-white">
          Create a marketplace product
        </p>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
          Monetize research, artificial
          intelligence, systems, bots,
          indicators, education and community.
        </p>

        <div className="mt-7">
          <Label>Product category</Label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const selected =
                type === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() =>
                    setType(category.value)
                  }
                  className={`rounded-[20px] border p-4 text-left transition ${
                    selected
                      ? "border-[#b6ff00]/40 bg-[#b6ff00]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-[13px] text-[10px] font-black ${
                      selected
                        ? "bg-[#b6ff00] text-black"
                        : "bg-white/[0.05] text-white/45"
                    }`}
                  >
                    {category.icon}
                  </span>

                  <p
                    className={`mt-4 font-black ${
                      selected
                        ? "text-[#b6ff00]"
                        : "text-white"
                    }`}
                  >
                    {category.value}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {category.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <Field
            label="Product Title"
            value={title}
            onChange={setTitle}
            placeholder={
              type === "Trading Bot"
                ? "Gold Execution Bot"
                : type === "AI"
                  ? "Bullions AI Analyst"
                  : type === "Indicator"
                    ? "BTC Momentum Indicator"
                    : "Ghost Alpha Monthly Letter"
            }
          />

          <div>
            <Label>Billing</Label>

            <select
              value={billing}
              onChange={(event) =>
                setBilling(
                  event.target
                    .value as ProductBilling
                )
              }
              className="w-full rounded-[18px] border border-white/10 bg-[#0d0d0d] px-5 py-4 text-white outline-none"
            >
              <option value="free">
                Free
              </option>
              <option value="monthly">
                Monthly
              </option>
              <option value="yearly">
                Yearly
              </option>
              <option value="one_time">
                One-time
              </option>
            </select>
          </div>

          {billing !== "free" ? (
            <Field
              label="Price USD"
              value={priceUsd}
              onChange={setPriceUsd}
              placeholder="99"
              type="number"
            />
          ) : null}

          <Field
            label="Access or Checkout URL"
            value={accessUrl}
            onChange={setAccessUrl}
            placeholder="https://..."
          />

          <div className="lg:col-span-2">
            <Label>Description</Label>

            <textarea
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Explain what the buyer receives, how access works and who this product is designed for."
              className="w-full rounded-[20px] border border-white/10 bg-[#0d0d0d] px-5 py-4 leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#b6ff00]/50"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm text-white/55">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) =>
                setActive(
                  event.target.checked
                )
              }
              className="h-4 w-4 accent-[#b6ff00]"
            />

            Publish immediately
          </label>

          <button
            type="button"
            onClick={createProduct}
            disabled={saving}
            className="h-12 rounded-full bg-[#b6ff00] px-8 text-[10px] font-black uppercase tracking-[0.16em] text-black disabled:opacity-40"
          >
            {saving
              ? "Creating..."
              : "Create Product"}
          </button>
        </div>
      </section>

      {products.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-[26px] border border-white/10 bg-[#0b0c0b] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b6ff00]">
                    {product.type}
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    {product.title}
                  </h3>
                </div>

                <span
                  className={`rounded-full border px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] ${
                    product.active
                      ? "border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[#b6ff00]"
                      : "border-white/10 text-white/30"
                  }`}
                >
                  {product.active
                    ? "Live"
                    : "Draft"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/40">
                {product.description}
              </p>

              <p className="mt-6 text-3xl font-black text-white">
                {product.billing === "free"
                  ? "Free"
                  : `$${product.priceUsd.toLocaleString()}`}

                {product.billing !==
                  "free" ? (
                  <span className="ml-1 text-sm text-white/30">
                    {product.billing ===
                    "monthly"
                      ? "/ month"
                      : product.billing ===
                          "yearly"
                        ? "/ year"
                        : ""}
                  </span>
                ) : null}
              </p>

              <div className="mt-6 flex gap-2 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    toggleProduct(product.id)
                  }
                  className="h-11 flex-1 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.14em] text-white/55"
                >
                  {product.active
                    ? "Move to Draft"
                    : "Publish"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    removeProduct(product.id)
                  }
                  className="h-11 rounded-full border border-red-400/15 bg-red-400/[0.06] px-5 text-[9px] font-black uppercase tracking-[0.14em] text-red-300"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[220px] place-items-center rounded-[28px] border border-dashed border-white/10 text-center">
          <div>
            <p className="text-2xl font-black">
              Marketplace empty
            </p>

            <p className="mt-3 text-sm text-white/35">
              Create your first product,
              system or service.
            </p>
          </div>
        </div>
      )}

      {message ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block text-xs font-black uppercase tracking-[0.2em] text-white/35">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-[18px] border border-white/10 bg-[#0d0d0d] px-5 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#b6ff00]/50"
      />
    </div>
  );
}
