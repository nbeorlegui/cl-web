"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createPropertyAction,
  deletePropertyAction,
  updatePropertyAction,
} from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export type UserRole = "superadmin" | "admin" | "user";

type PropertyImage = {
  id: string;
  url: string | null;
  is_cover: boolean | null;
  position: number | null;
};

export type Property = {
  id: string;
  code: string | null;
  title: string | null;
  slug: string | null;
  description: string | null;
  short_description: string | null;
  operation: string | null;
  property_type: string | null;
  status: string | null;
  price: number | null;
  currency: string | null;
  expenses: number | null;
  has_expenses: boolean | null;
  province: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  show_address: boolean | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  rooms: number | null;
  garages: number | null;
  garage_type: string | null;
  covered_area: number | null;
  total_area: number | null;
  land_area: number | null;
  age_years: number | null;
  floors_count: number | null;
  condition: string | null;
  private_neighborhood: boolean | null;
  semi_private: boolean | null;
  apt_credit: boolean | null;
  furnished: boolean | null;
  financing: boolean | null;
  accepts_exchange: boolean | null;
  accepts_pets: boolean | null;
  has_water: boolean | null;
  has_electricity: boolean | null;
  has_gas: boolean | null;
  has_internet: boolean | null;
  energy_efficiency: string | null;
  has_equipped_kitchen: boolean | null;
  has_laundry: boolean | null;
  has_air_conditioning: boolean | null;
  has_fireplace: boolean | null;
  has_sauna: boolean | null;
  heating_type: string | null;
  has_pool: boolean | null;
  has_garden: boolean | null;
  has_bbq: boolean | null;
  published: boolean | null;
  featured: boolean | null;
  is_dalvian: boolean | null;
  owner_name: string | null;
  owner_phone: string | null;
  internal_notes: string | null;
  created_at: string;
  property_images?: PropertyImage[] | null;
};

type Props = {
  properties: Property[];
  errorMessage: string | null;
  successMessage: string | null;
  currentUserRole: UserRole;
};

type EditableImage = {
  uid: string;
  kind: "existing" | "new";
  id?: string;
  url: string;
  isCover: boolean;
  originalIndex?: number;
  file?: File;
  uploadedUrl?: string;
};

const ITEMS_PER_PAGE = 5;

type PropertyFilters = {
  search: string;
  operation: string;
  propertyType: string;
  status: string;
  publication: string;
  minPrice: string;
  maxPrice: string;
};

const DEFAULT_FILTERS: PropertyFilters = {
  search: "",
  operation: "",
  propertyType: "",
  status: "",
  publication: "",
  minPrice: "",
  maxPrice: "",
};

function formatPrice(value: number | null, currency: string | null) {
  if (!value) return "-";

  return `${currency || "USD"} ${new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function getCoverImage(property: Property) {
  const images = property.property_images || [];

  return (
    images.find((image) => image.is_cover && image.url)?.url ||
    images
      .filter((image) => image.url)
      .sort((a, b) => (a.position || 999) - (b.position || 999))[0]?.url ||
    null
  );
}

function textValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function slugifyFileName(value: string) {
  const extension = value.split(".").pop()?.toLowerCase() || "jpg";
  const base = value
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);

  return `${base || "imagen"}.${extension}`;
}


function CheckField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean | null;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={Boolean(defaultChecked)}
        className="h-4 w-4 accent-[#D71920]"
      />
      {label}
    </label>
  );
}

function YesNoField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: boolean | null;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ? "true" : "false"}
        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
      >
        <option value="false">No</option>
        <option value="true">Sí</option>
      </select>
    </label>
  );
}

function InputField({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={textValue(defaultValue)}
        placeholder={placeholder}
        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue || ""}
        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
      >
        <option value="">Seleccionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SubmitButton({
  children,
  loadingText,
  className,
}: {
  children: string;
  loadingText: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? loadingText : children}
    </button>
  );
}

function SortableImageCard({
  image,
  onSetCover,
  onRemove,
}: {
  image: EditableImage;
  onSetCover: (uid: string) => void;
  onRemove: (image: EditableImage) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.uid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative h-32 overflow-hidden rounded-2xl border bg-slate-100 transition ${
        image.isCover
          ? "border-[#D71920] ring-4 ring-[#D71920]/15"
          : "border-slate-200 hover:border-[#D71920]/60"
      } ${isDragging ? "z-20 opacity-80 shadow-2xl" : ""}`}
    >
      {image.kind === "existing" ? (
        <Image
          src={image.url}
          alt="Imagen propiedad"
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="240px"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.url}
          alt="Imagen nueva"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      )}

      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />

      <button
        type="button"
        onClick={() => onSetCover(image.uid)}
        className={`absolute left-2 top-2 rounded-full px-3 py-1.5 text-[10px] font-bold shadow-sm backdrop-blur transition ${
          image.isCover
            ? "bg-[#D71920] text-white"
            : "bg-white/95 text-[#111111] hover:bg-[#D71920] hover:text-white"
        }`}
      >
        {image.isCover ? "Portada" : "Usar portada"}
      </button>

      <button
        type="button"
        onClick={() => onRemove(image)}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white transition hover:bg-[#D71920]"
        title={image.kind === "existing" ? "Eliminar imagen" : "Quitar imagen"}
      >
        ×
      </button>

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute bottom-2 right-2 flex h-8 w-8 cursor-grab items-center justify-center rounded-full bg-white/95 text-sm font-black text-[#111111] shadow-sm backdrop-blur active:cursor-grabbing"
        title="Arrastrar para ordenar"
      >
        ↕
      </button>

      {image.kind === "new" && (
        <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#D71920] shadow-sm">
          Nueva
        </span>
      )}
    </div>
  );
}

export default function PropertiesDashboardClient({
  properties,
  errorMessage,
  successMessage,
  currentUserRole,
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [editableImages, setEditableImages] = useState<EditableImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [isSavingProperty, setIsSavingProperty] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [visibleSuccessMessage, setVisibleSuccessMessage] = useState(successMessage);
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );


  useEffect(() => {
    if (!successMessage) {
      setVisibleSuccessMessage(null);
      return;
    }

    setVisibleSuccessMessage(successMessage);

    const timeout = window.setTimeout(() => {
      setVisibleSuccessMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const canManageProperties =
    currentUserRole === "superadmin" || currentUserRole === "admin";

  const operationOptions = useMemo(() => {
    return Array.from(
      new Set(properties.map((property) => property.operation).filter(Boolean))
    ) as string[];
  }, [properties]);

  const typeOptions = useMemo(() => {
    return Array.from(
      new Set(properties.map((property) => property.property_type).filter(Boolean))
    ) as string[];
  }, [properties]);

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(properties.map((property) => property.status).filter(Boolean))
    ) as string[];
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const minPrice = filters.minPrice ? Number(filters.minPrice) : null;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;

    return properties.filter((property) => {
      const searchableText = [
        property.code,
        property.title,
        property.neighborhood,
        property.city,
        property.province,
        property.address,
        property.owner_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (search && !searchableText.includes(search)) return false;
      if (filters.operation && property.operation !== filters.operation) return false;
      if (filters.propertyType && property.property_type !== filters.propertyType) {
        return false;
      }
      if (filters.status && (property.status || "activa") !== filters.status) {
        return false;
      }
      if (filters.publication === "published" && !property.published) return false;
      if (filters.publication === "hidden" && property.published) return false;
      if (minPrice !== null && (property.price || 0) < minPrice) return false;
      if (maxPrice !== null && (property.price || 0) > maxPrice) return false;

      return true;
    });
  }, [filters, properties]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProperties = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, safeCurrentPage]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  function updateFilter<Key extends keyof PropertyFilters>(
    key: Key,
    value: PropertyFilters[Key]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
    setCurrentPage(1);
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }

  function resetImageState() {
    setEditableImages((current) => {
      current
        .filter((image) => image.kind === "new")
        .forEach((image) => URL.revokeObjectURL(image.url));

      return [];
    });

    setDeletedImageIds([]);
  }

  function openCreateModal() {
    setEditingProperty(null);
    setFormError(null);
    setIsSavingProperty(false);
    resetImageState();
    setIsFormOpen(true);
  }

  function openEditModal(property: Property) {
    if (!canManageProperties) return;

    resetImageState();

    const sortedImages = [...(property.property_images || [])]
      .filter((image) => image.url)
      .sort((a, b) => (a.position || 999) - (b.position || 999));

    const existingEditableImages: EditableImage[] = sortedImages.map(
      (image, index) => ({
        uid: `existing-${image.id}`,
        kind: "existing",
        id: image.id,
        url: image.url || "",
        isCover:
          Boolean(image.is_cover) ||
          !sortedImages.some((item) => item.is_cover) && index === 0,
      })
    );

    setEditableImages(existingEditableImages);
    setFormError(null);
    setIsSavingProperty(false);
    setEditingProperty(property);
    setIsFormOpen(true);
  }

  function closeFormModal() {
    setEditingProperty(null);
    setFormError(null);
    setIsSavingProperty(false);
    resetImageState();
    setIsFormOpen(false);
  }

  function openDeleteModal(property: Property) {
    if (!canManageProperties) return;
    setPropertyToDelete(property);
  }

  function handleImagesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []);

    setEditableImages((current) => {
      current
        .filter((image) => image.kind === "new")
        .forEach((image) => URL.revokeObjectURL(image.url));

      const withoutOldNewImages = current.filter(
        (image) => image.kind === "existing"
      );

      const newImages: EditableImage[] = files.map((file, index) => ({
        uid: `new-${index}-${file.name}-${file.lastModified}`,
        kind: "new",
        url: URL.createObjectURL(file),
        originalIndex: index,
        file,
        isCover: false,
      }));

      const merged = [...withoutOldNewImages, ...newImages];
      const hasCover = merged.some((image) => image.isCover);

      if (!hasCover && merged.length > 0) {
        return merged.map((image, index) => ({
          ...image,
          isCover: index === 0,
        }));
      }

      return merged;
    });
  }

  function setCoverImage(uid: string) {
    setEditableImages((current) =>
      current.map((image) => ({
        ...image,
        isCover: image.uid === uid,
      }))
    );
  }

  function removeEditableImage(imageToRemove: EditableImage) {
    setEditableImages((current) => {
      const next = current.filter((image) => image.uid !== imageToRemove.uid);

      if (imageToRemove.kind === "existing" && imageToRemove.id) {
        setDeletedImageIds((ids) =>
          ids.includes(imageToRemove.id || "") ? ids : [...ids, imageToRemove.id || ""]
        );
      }

      if (imageToRemove.kind === "new") {
        URL.revokeObjectURL(imageToRemove.url);
      }

      if (imageToRemove.isCover && next.length > 0) {
        return next.map((image, index) => ({
          ...image,
          isCover: index === 0,
        }));
      }

      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setEditableImages((current) => {
      const oldIndex = current.findIndex((image) => image.uid === active.id);
      const newIndex = current.findIndex((image) => image.uid === over.id);

      if (oldIndex === -1 || newIndex === -1) return current;

      return arrayMove(current, oldIndex, newIndex);
    });
  }

  const imagesOrderPayload = JSON.stringify(
    editableImages.map((image, index) => ({
      uid: image.uid,
      kind: image.kind,
      id: image.id || null,
      originalIndex: image.originalIndex ?? null,
      position: index + 1,
      isCover: image.isCover,
      url: image.kind === "existing" ? image.url : image.uploadedUrl || null,
    }))
  );

  async function buildUploadedImagesOrderPayload() {
    const supabase = createSupabaseBrowserClient();

    const uploadedImages = await Promise.all(
      editableImages.map(async (image, index) => {
        if (image.kind === "existing") {
          return {
            uid: image.uid,
            kind: image.kind,
            id: image.id || null,
            originalIndex: image.originalIndex ?? null,
            position: index + 1,
            isCover: image.isCover,
            url: image.url,
          };
        }

        if (!image.file) {
          return {
            uid: image.uid,
            kind: image.kind,
            id: null,
            originalIndex: image.originalIndex ?? null,
            position: index + 1,
            isCover: image.isCover,
            url: image.uploadedUrl || null,
          };
        }

        const filePath = `pending/${crypto.randomUUID()}-${slugifyFileName(
          image.file.name
        )}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, image.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: image.file.type || "image/jpeg",
          });

        if (uploadError) {
          throw new Error(uploadError.message || "No se pudo subir una imagen.");
        }

        const { data: publicUrlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        return {
          uid: image.uid,
          kind: image.kind,
          id: null,
          originalIndex: image.originalIndex ?? null,
          position: index + 1,
          isCover: image.isCover,
          url: publicUrlData.publicUrl,
        };
      })
    );

    return JSON.stringify(uploadedImages);
  }

  async function handlePropertyFormSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSavingProperty) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const successParam = editingProperty ? "update" : "create";

    setIsSavingProperty(true);
    setFormError(null);

    try {
      const uploadedImagesOrder = await buildUploadedImagesOrderPayload();
      formData.set("images_order", uploadedImagesOrder);

      if (editingProperty) {
        await updatePropertyAction(formData);
      } else {
        await createPropertyAction(formData);
      }

      closeFormModal();
      router.replace(`/dashboard/propiedades?success=${successParam}`);
      router.refresh();
    } catch (error) {
      console.error("Error saving property:", error);

      const errorDigest =
        typeof error === "object" && error && "digest" in error
          ? String((error as { digest?: unknown }).digest || "")
          : "";

      if (errorDigest.includes("NEXT_REDIRECT")) {
        window.location.href = `/dashboard/propiedades?success=${successParam}`;
        return;
      }

      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la propiedad. Intentá nuevamente."
      );
      setIsSavingProperty(false);
    }
  }

  return (
    <section className="w-full">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D71920]">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
            Propiedades
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Administrá las propiedades cargadas, su estado y publicación web.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#D71920] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#B9151B]"
        >
          Nueva propiedad
        </button>
      </div>

      {visibleSuccessMessage && (
        <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {visibleSuccessMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-[#D71920]">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111111]">
            Listado de propiedades
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredProperties.length} de {properties.length} propiedades
            {hasActiveFilters ? " según filtros" : " cargadas"}
          </p>
        </div>

        <div className="border-b border-slate-200 bg-slate-50/60 px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            <label className="block xl:col-span-2">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Buscar
              </span>
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Nombre, código, zona..."
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Operación
              </span>
              <select
                value={filters.operation}
                onChange={(event) =>
                  updateFilter("operation", event.target.value)
                }
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
              >
                <option value="">Todas</option>
                {operationOptions.map((operation) => (
                  <option key={operation} value={operation}>
                    {operation}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Tipo
              </span>
              <select
                value={filters.propertyType}
                onChange={(event) =>
                  updateFilter("propertyType", event.target.value)
                }
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
              >
                <option value="">Todos</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Estado
              </span>
              <select
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
              >
                <option value="">Todos</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Web
              </span>
              <select
                value={filters.publication}
                onChange={(event) =>
                  updateFilter("publication", event.target.value)
                }
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
              >
                <option value="">Todas</option>
                <option value="published">Publicadas</option>
                <option value="hidden">Ocultas</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Desde
                </span>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(event) =>
                    updateFilter("minPrice", event.target.value)
                  }
                  placeholder="0"
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Hasta
                </span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(event) =>
                    updateFilter("maxPrice", event.target.value)
                  }
                  placeholder="Max"
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-[#111111] outline-none transition placeholder:text-slate-500 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                />
              </label>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              Mostrando {paginatedProperties.length} de {filteredProperties.length}
              {filteredProperties.length === 1 ? " propiedad" : " propiedades"}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-9 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-[#D71920] hover:text-[#D71920]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto border-t border-slate-200 pb-3">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <th className="w-[95px] px-3 py-3">Código</th>
                <th className="w-[105px] px-3 py-3">Imagen</th>
                <th className="w-[310px] px-3 py-3">Propiedad</th>
                <th className="w-[105px] px-3 py-3">Operación</th>
                <th className="w-[120px] px-3 py-3">Tipo</th>
                <th className="w-[125px] px-3 py-3">Precio</th>
                <th className="w-[105px] px-3 py-3">Estado</th>
                <th className="w-[120px] px-3 py-3">Web</th>
                {canManageProperties && (
                  <th className="sticky right-0 z-10 w-[95px] bg-slate-50 px-3 py-3 text-right shadow-[-8px_0_12px_rgba(15,23,42,0.06)]">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedProperties.map((property) => {
                const coverImage = getCoverImage(property);

                return (
                  <tr key={property.id} className="align-middle">
                    <td className="w-[95px] px-3 py-3 text-sm font-bold text-slate-600">
                      {property.code || "-"}
                    </td>
                    <td className="w-[105px] px-3 py-3">
                      <div className="relative h-12 w-[82px] overflow-hidden rounded-xl bg-slate-100">
                        {coverImage ? (
                          <Image
                            src={coverImage}
                            alt={property.title || "Propiedad"}
                            fill
                            className="object-cover"
                            sizes="82px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] font-bold uppercase text-slate-400">
                            Sin img
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="w-[310px] px-3 py-3">
                      <p className="max-w-[280px] truncate text-sm font-semibold leading-5 text-[#111111]">
                        {property.title || "Sin título"}
                      </p>
                      <p className="mt-1 max-w-[280px] truncate text-xs text-slate-500">
                        {[property.neighborhood, property.city]
                          .filter(Boolean)
                          .join(", ") || "Sin ubicación"}
                      </p>
                    </td>
                    <td className="w-[105px] px-3 py-3 text-sm text-slate-700">
                      {property.operation || "-"}
                    </td>
                    <td className="w-[120px] px-3 py-3 text-sm text-slate-700">
                      {property.property_type || "-"}
                    </td>
                    <td className="w-[125px] px-3 py-3 text-sm font-bold text-[#111111]">
                      {formatPrice(property.price, property.currency)}
                    </td>
                    <td className="w-[105px] px-3 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase text-slate-600">
                        {property.status || "Activa"}
                      </span>
                    </td>
                    <td className="w-[120px] px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                          property.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {property.published ? "Publicada" : "Oculta"}
                      </span>
                    </td>
                    {canManageProperties && (
                      <td className="sticky right-0 z-10 w-[95px] bg-white px-3 py-3 shadow-[-8px_0_12px_rgba(15,23,42,0.05)]">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(property)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
                            title="Editar propiedad"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(property)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-[#D71920] transition hover:bg-[#D71920] hover:text-white"
                            title="Eliminar propiedad"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {!paginatedProperties.length && (
                <tr>
                  <td
                    colSpan={canManageProperties ? 9 : 8}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    {hasActiveFilters
                      ? "No hay propiedades que coincidan con los filtros."
                      : "Todavía no hay propiedades cargadas."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-slate-500">
            Página {safeCurrentPage} de {totalPages} · {ITEMS_PER_PAGE} por página
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safeCurrentPage === 1}
              className="h-9 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                const isActive = page === safeCurrentPage;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 min-w-9 rounded-2xl px-3 text-xs font-bold transition ${
                      isActive
                        ? "bg-[#D71920] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-[#D71920] hover:text-[#D71920]"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={safeCurrentPage === totalPages}
              className="h-9 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-6">
          <div className="mx-auto w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D71920]">
                  {editingProperty ? "Editar propiedad" : "Nueva propiedad"}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111111]">
                  {editingProperty
                    ? editingProperty.title || "Propiedad"
                    : "Crear propiedad"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#D71920] hover:text-[#D71920]"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handlePropertyFormSubmit}
              className="space-y-5 p-5"
            >
              {editingProperty && (
                <>
                  <input type="hidden" name="id" value={editingProperty.id} />
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Código
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {editingProperty.code || "Se genera automáticamente"}
                    </p>
                  </div>
                </>
              )}

              <input type="hidden" name="images_order" value={imagesOrderPayload} />
              {deletedImageIds.map((imageId) => (
                <input
                  key={imageId}
                  type="hidden"
                  name="delete_image_ids"
                  value={imageId}
                />
              ))}

              <div className="grid gap-4 md:grid-cols-3">
                <InputField
                  label="Título"
                  name="title"
                  defaultValue={editingProperty?.title}
                  placeholder="Ej: Casa moderna en Chacras"
                />
                <InputField
                  label="Slug"
                  name="slug"
                  defaultValue={editingProperty?.slug}
                  placeholder="Se genera con el título si queda vacío"
                />
                <SelectField
                  label="Estado"
                  name="status"
                  defaultValue={editingProperty?.status || "activa"}
                  options={[
                    { label: "Activa", value: "activa" },
                    { label: "Reservada", value: "reservada" },
                    { label: "Vendida", value: "vendida" },
                    { label: "Alquilada", value: "alquilada" },
                    { label: "Inactiva", value: "inactiva" },
                  ]}
                />
                <SelectField
                  label="Operación"
                  name="operation"
                  defaultValue={editingProperty?.operation || "Venta"}
                  options={[
                    { label: "Venta", value: "Venta" },
                    { label: "Alquiler", value: "Alquiler" },
                  ]}
                />
                <SelectField
                  label="Tipo"
                  name="property_type"
                  defaultValue={editingProperty?.property_type || "Casa"}
                  options={[
                    { label: "Casa", value: "Casa" },
                    { label: "Departamento", value: "Departamento" },
                    { label: "Dúplex", value: "Dúplex" },
                    { label: "Lote", value: "Lote" },
                    { label: "Terreno", value: "Terreno" },
                    { label: "Local", value: "Local" },
                    { label: "Finca", value: "Finca" },
                  ]}
                />
                <SelectField
                  label="Moneda"
                  name="currency"
                  defaultValue={editingProperty?.currency || "USD"}
                  options={[
                    { label: "USD", value: "USD" },
                    { label: "ARS", value: "ARS" },
                  ]}
                />
                <InputField
                  label="Precio"
                  name="price"
                  type="number"
                  defaultValue={editingProperty?.price}
                />
                <InputField
                  label="Provincia"
                  name="province"
                  defaultValue={editingProperty?.province || "Mendoza"}
                />
                <InputField
                  label="Ciudad"
                  name="city"
                  defaultValue={editingProperty?.city}
                />
                <InputField
                  label="Barrio/Zona"
                  name="neighborhood"
                  defaultValue={editingProperty?.neighborhood}
                />
                <InputField
                  label="Dirección"
                  name="address"
                  defaultValue={editingProperty?.address}
                />
                <InputField
                  label="Latitud"
                  name="latitude"
                  type="number"
                  defaultValue={editingProperty?.latitude}
                />
                <InputField
                  label="Longitud"
                  name="longitude"
                  type="number"
                  defaultValue={editingProperty?.longitude}
                />
                <InputField
                  label="Dormitorios"
                  name="bedrooms"
                  type="number"
                  defaultValue={editingProperty?.bedrooms}
                />
                <InputField
                  label="Baños"
                  name="bathrooms"
                  type="number"
                  defaultValue={editingProperty?.bathrooms}
                />
                <InputField
                  label="Ambientes"
                  name="rooms"
                  type="number"
                  defaultValue={editingProperty?.rooms}
                />
                <InputField
                  label="Cocheras"
                  name="garages"
                  type="number"
                  defaultValue={editingProperty?.garages}
                />
                <InputField
                  label="Tipo cochera"
                  name="garage_type"
                  defaultValue={editingProperty?.garage_type}
                />
                <InputField
                  label="Sup. cubierta"
                  name="covered_area"
                  type="number"
                  defaultValue={editingProperty?.covered_area}
                />
                <InputField
                  label="Sup. total"
                  name="total_area"
                  type="number"
                  defaultValue={editingProperty?.total_area}
                />
                <InputField
                  label="Terreno"
                  name="land_area"
                  type="number"
                  defaultValue={editingProperty?.land_area}
                />
                <InputField
                  label="Antigüedad"
                  name="age_years"
                  type="number"
                  defaultValue={editingProperty?.age_years}
                />
                <InputField
                  label="Plantas"
                  name="floors_count"
                  type="number"
                  defaultValue={editingProperty?.floors_count}
                />
                <InputField
                  label="Estado conservación"
                  name="condition"
                  defaultValue={editingProperty?.condition}
                />
                <InputField
                  label="Eficiencia energética"
                  name="energy_efficiency"
                  defaultValue={editingProperty?.energy_efficiency}
                />
                <InputField
                  label="Propietario"
                  name="owner_name"
                  defaultValue={editingProperty?.owner_name}
                />
                <InputField
                  label="Teléfono propietario"
                  name="owner_phone"
                  defaultValue={editingProperty?.owner_phone}
                />
              </div>

              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Comodidades y condiciones
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <YesNoField
                    label="Amoblado"
                    name="furnished"
                    defaultValue={editingProperty?.furnished}
                  />
                  <YesNoField
                    label="Tiene expensas"
                    name="has_expenses"
                    defaultValue={editingProperty?.has_expenses}
                  />
                  <InputField
                    label="Valor expensas"
                    name="expenses"
                    type="number"
                    defaultValue={editingProperty?.expenses}
                    placeholder="Ej: 120000"
                  />
                  <YesNoField
                    label="Aceptan mascotas"
                    name="accepts_pets"
                    defaultValue={editingProperty?.accepts_pets}
                  />
                  <YesNoField
                    label="Aire acondicionado"
                    name="has_air_conditioning"
                    defaultValue={editingProperty?.has_air_conditioning}
                  />
                  <SelectField
                    label="Calefacción"
                    name="heating_type"
                    defaultValue={editingProperty?.heating_type}
                    options={[
                      { label: "No especifica", value: "" },
                      { label: "Estufa", value: "Estufa" },
                      { label: "Radiadores", value: "Radiadores" },
                      { label: "Losa radiante", value: "Losa radiante" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Descripción corta
                  </span>
                  <textarea
                    name="short_description"
                    defaultValue={textValue(editingProperty?.short_description)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Notas internas
                  </span>
                  <textarea
                    name="internal_notes"
                    defaultValue={textValue(editingProperty?.internal_notes)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Descripción
                  </span>
                  <textarea
                    name="description"
                    defaultValue={textValue(editingProperty?.description)}
                    rows={7}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
                  />
                </label>
              </div>

              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Configuración
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <CheckField
                    label="Publicar en web"
                    name="published"
                    defaultChecked={editingProperty?.published}
                  />
                  <CheckField
                    label="Destacada"
                    name="featured"
                    defaultChecked={editingProperty?.featured}
                  />
                  <CheckField
                    label="Dalvian"
                    name="is_dalvian"
                    defaultChecked={editingProperty?.is_dalvian}
                  />
                  <CheckField
                    label="Mostrar dirección"
                    name="show_address"
                    defaultChecked={editingProperty?.show_address}
                  />
                  <CheckField
                    label="Barrio privado"
                    name="private_neighborhood"
                    defaultChecked={editingProperty?.private_neighborhood}
                  />
                  <CheckField
                    label="Semi Privado"
                    name="semi_private"
                    defaultChecked={editingProperty?.semi_private}
                  />
                  <CheckField
                    label="Apto crédito"
                    name="apt_credit"
                    defaultChecked={editingProperty?.apt_credit}
                  />
                  <CheckField
                    label="Financiación"
                    name="financing"
                    defaultChecked={editingProperty?.financing}
                  />
                  <CheckField
                    label="Permuta"
                    name="accepts_exchange"
                    defaultChecked={editingProperty?.accepts_exchange}
                  />
                  <CheckField
                    label="Agua"
                    name="has_water"
                    defaultChecked={editingProperty?.has_water}
                  />
                  <CheckField
                    label="Electricidad"
                    name="has_electricity"
                    defaultChecked={editingProperty?.has_electricity}
                  />
                  <CheckField
                    label="Gas"
                    name="has_gas"
                    defaultChecked={editingProperty?.has_gas}
                  />
                  <CheckField
                    label="Internet"
                    name="has_internet"
                    defaultChecked={editingProperty?.has_internet}
                  />
                  <CheckField
                    label="Cocina equipada"
                    name="has_equipped_kitchen"
                    defaultChecked={editingProperty?.has_equipped_kitchen}
                  />
                  <CheckField
                    label="Lavandería"
                    name="has_laundry"
                    defaultChecked={editingProperty?.has_laundry}
                  />
                  <CheckField
                    label="Chimenea"
                    name="has_fireplace"
                    defaultChecked={editingProperty?.has_fireplace}
                  />
                  <CheckField
                    label="Sauna"
                    name="has_sauna"
                    defaultChecked={editingProperty?.has_sauna}
                  />
                  <CheckField
                    label="Piscina"
                    name="has_pool"
                    defaultChecked={editingProperty?.has_pool}
                  />
                  <CheckField
                    label="Jardín"
                    name="has_garden"
                    defaultChecked={editingProperty?.has_garden}
                  />
                  <CheckField
                    label="Churrasquera"
                    name="has_bbq"
                    defaultChecked={editingProperty?.has_bbq}
                  />
                </div>
              </div>

              <div>
                <label>
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Imágenes
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#D71920] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                  />
                </label>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex flex-col gap-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Galería de imágenes
                    </p>
                    <p className="text-xs leading-5 text-slate-500">
                      Arrastrá las fotos para definir el orden. También podés
                      elegir la portada y eliminar las que no quieras.
                    </p>
                  </div>

                  {editableImages.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={editableImages.map((image) => image.uid)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {editableImages.map((image) => (
                            <SortableImageCard
                              key={image.uid}
                              image={image}
                              onSetCover={setCoverImage}
                              onRemove={removeEditableImage}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                      Todavía no hay imágenes. Seleccioná una o más fotos para
                      previsualizarlas antes de guardar.
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-[#D71920]">
                  {formError}
                </div>
              )}

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white py-4">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="h-10 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProperty}
                  className="h-10 rounded-2xl bg-[#D71920] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#B9151B] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingProperty
                    ? editingProperty
                      ? "Guardando..."
                      : "Creando..."
                    : editingProperty
                      ? "Guardar cambios"
                      : "Crear propiedad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D71920]">
              Eliminar propiedad
            </p>
            <h2 className="mt-3 text-xl font-semibold text-[#111111]">
              ¿Eliminar esta propiedad?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Esta acción quitará la propiedad del panel y del sitio web.
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-[#111111]">
                {propertyToDelete.title || "Propiedad sin título"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {propertyToDelete.code || "Sin código"}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-[#D71920] hover:text-[#D71920]"
              >
                Cancelar
              </button>
              <form action={deletePropertyAction}>
                <input type="hidden" name="id" value={propertyToDelete.id} />
                <SubmitButton
                  loadingText="Eliminando..."
                  className="h-10 rounded-2xl bg-[#D71920] px-4 text-sm font-bold text-white transition hover:bg-[#B9151B] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Eliminar
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
