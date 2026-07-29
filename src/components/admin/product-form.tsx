'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PackagePlus } from 'lucide-react';
import { toast } from 'sonner';
import type { Brand, Category } from '@/core/domain/entities';
import {
  CARD_GRADES,
  CONDITIONS,
  PRODUCT_TYPES,
  RARITIES,
  TCG_GAMES,
  cardGradeList,
} from '@/core/domain/taxonomy';
import { AdminCard } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Field, Input, Label, Textarea } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/controls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { productDraftSchema, slugify, type ProductDraft } from '@/lib/product-schema';

interface ProductFormProps {
  categories: Category[];
  brands: Brand[];
}

const LANGUAGES = ['português', 'inglês', 'japonês'] as const;

/** Estado inicial da ficha de carta — só entra no envio quando o tipo pede. */
const EMPTY_CARD: ProductDraft['card'] = {
  game: 'pokemon',
  set: '',
  setCode: '',
  number: '',
  rarity: 'rara',
  language: 'português',
  cardType: '',
  hp: null,
  illustrator: '',
  foil: false,
  grade: 'NM',
};

/** Digita em reais, guarda em centavos — o domínio só conhece inteiros. */
function MoneyInput({
  value,
  onChange,
  id,
  placeholder,
}: {
  value: number | null;
  onChange: (cents: number | null) => void;
  id?: string;
  placeholder?: string;
}) {
  const [text, setText] = React.useState(value === null ? '' : (value / 100).toFixed(2).replace('.', ','));

  return (
    <Input
      id={id}
      inputMode="decimal"
      placeholder={placeholder ?? '0,00'}
      value={text}
      onChange={(event) => {
        const raw = event.target.value;
        setText(raw);
        const parsed = Number(raw.replace(/\./g, '').replace(',', '.'));
        onChange(raw.trim() === '' || !Number.isFinite(parsed) ? null : Math.round(parsed * 100));
      }}
    />
  );
}

export function ProductForm({ categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductDraft>({
    resolver: zodResolver(productDraftSchema),
    defaultValues: {
      name: '',
      slug: '',
      subtitle: '',
      sku: '',
      type: 'tcg-card',
      categorySlug: categories[0]?.slug ?? '',
      brandSlug: brands[0]?.slug ?? '',
      price: 0,
      compareAtPrice: null,
      stock: 0,
      condition: 'novo',
      description: '',
      tags: [],
      featured: false,
      preOrder: false,
      card: EMPTY_CARD,
    },
  });

  const type = watch('type');
  const isCard = type === 'tcg-card';
  const name = watch('name');

  // Enquanto o slug não for editado à mão, ele acompanha o nome.
  React.useEffect(() => {
    if (!slugTouched) setValue('slug', slugify(name ?? ''), { shouldValidate: false });
  }, [name, slugTouched, setValue]);

  // Só carta avulsa carrega ficha; os demais tipos enviam null.
  React.useEffect(() => {
    setValue('card', isCard ? EMPTY_CARD : null, { shouldValidate: false });
  }, [isCard, setValue]);

  const onSubmit = handleSubmit(async (draft) => {
    const response = await fetch('/api/admin/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const field = payload?.field as keyof ProductDraft | undefined;
      const message = payload?.message ?? 'Não foi possível cadastrar o produto.';
      if (field) setError(field, { message });
      toast.error(message);
      return;
    }

    toast.success('Produto cadastrado', { description: draft.name });
    router.push('/admin/produtos');
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <AdminCard title="Identificação">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nome" required error={errors.name?.message} htmlFor="name">
            <Input id="name" {...register('name')} placeholder="Charizard ex" />
          </Field>

          <Field
            label="Slug"
            required
            error={errors.slug?.message}
            hint="Gerado a partir do nome; edite se precisar."
            htmlFor="slug"
          >
            <Input
              id="slug"
              {...register('slug', { onChange: () => setSlugTouched(true) })}
              placeholder="charizard-ex-obsidian-flames"
            />
          </Field>

          <Field label="Subtítulo" required error={errors.subtitle?.message} htmlFor="subtitle">
            <Input id="subtitle" {...register('subtitle')} placeholder="Special Illustration Rare" />
          </Field>

          <Field label="SKU" required error={errors.sku?.message} htmlFor="sku">
            <Input id="sku" {...register('sku')} placeholder="GG-CRD-001" />
          </Field>

          <Field
            label="Descrição"
            required
            error={errors.description?.message}
            className="md:col-span-2"
            htmlFor="description"
          >
            <Textarea id="description" rows={4} {...register('description')} />
          </Field>
        </div>
      </AdminCard>

      <AdminCard title="Classificação">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Tipo de produto" required error={errors.type?.message}>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRODUCT_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Estado do produto" required error={errors.condition?.message}>
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONDITIONS).map(([value, meta]) => (
                      <SelectItem key={value} value={value}>
                        {meta.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Categoria" required error={errors.categorySlug?.message}>
            <Controller
              control={control}
              name="categorySlug"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Marca" required error={errors.brandSlug?.message}>
            <Controller
              control={control}
              name="brandSlug"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.slug} value={brand.slug}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>
      </AdminCard>

      <AdminCard title="Preço e estoque">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Preço (R$)" required error={errors.price?.message} htmlFor="price">
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <MoneyInput id="price" value={field.value} onChange={(v) => field.onChange(v ?? 0)} />
              )}
            />
          </Field>

          <Field
            label="Preço antigo (R$)"
            error={errors.compareAtPrice?.message}
            hint="Deixe vazio se não houver desconto."
            htmlFor="compareAtPrice"
          >
            <Controller
              control={control}
              name="compareAtPrice"
              render={({ field }) => (
                <MoneyInput id="compareAtPrice" value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>

          <Field label="Estoque" required error={errors.stock?.message} htmlFor="stock">
            <Input id="stock" type="number" min={0} {...register('stock', { valueAsNumber: true })} />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 border-t border-line pt-5">
          <Controller
            control={control}
            name="featured"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-2.5">
                <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                <span className="text-sm text-ink-muted">Produto em destaque</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="preOrder"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-2.5">
                <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                <span className="text-sm text-ink-muted">Pré-venda</span>
              </label>
            )}
          />
        </div>
      </AdminCard>

      {isCard ? (
        <AdminCard title="Ficha da carta">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Card game" required>
              <Controller
                control={control}
                name="card.game"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TCG_GAMES).map(([value, meta]) => (
                        <SelectItem key={value} value={value}>
                          {meta.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Coleção" required error={errors.card?.set?.message} htmlFor="card-set">
              <Input id="card-set" {...register('card.set')} placeholder="Obsidian Flames" />
            </Field>

            <Field label="Código" required error={errors.card?.setCode?.message} htmlFor="card-code">
              <Input id="card-code" {...register('card.setCode')} placeholder="OBF" />
            </Field>

            <Field label="Número" required error={errors.card?.number?.message} htmlFor="card-number">
              <Input id="card-number" {...register('card.number')} placeholder="223/197" />
            </Field>

            <Field label="Raridade" required>
              <Controller
                control={control}
                name="card.rarity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RARITIES).map(([value, meta]) => (
                        <SelectItem key={value} value={value}>
                          {meta.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* A escala de conservação pedida: NM, SP, MP e D. */}
            <Field
              label="Estado da carta"
              required
              hint={CARD_GRADES[watch('card.grade') ?? 'NM']?.description}
            >
              <Controller
                control={control}
                name="card.grade"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cardGradeList.map((grade) => (
                        <SelectItem key={grade.code} value={grade.code}>
                          {grade.code} · {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Idioma" required>
              <Controller
                control={control}
                name="card.language"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Tipo da carta" required error={errors.card?.cardType?.message} htmlFor="card-type">
              <Input id="card-type" {...register('card.cardType')} placeholder="Pokémon ex · Fogo" />
            </Field>

            <Field label="HP" error={errors.card?.hp?.message} htmlFor="card-hp">
              <Input
                id="card-hp"
                type="number"
                min={0}
                placeholder="330"
                {...register('card.hp', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                })}
              />
            </Field>

            <Field
              label="Ilustrador"
              required
              error={errors.card?.illustrator?.message}
              htmlFor="card-illustrator"
            >
              <Input id="card-illustrator" {...register('card.illustrator')} />
            </Field>

            <Controller
              control={control}
              name="card.foil"
              render={({ field }) => (
                <div className="flex flex-col justify-end gap-2">
                  <Label>Acabamento</Label>
                  <label className="flex h-11 cursor-pointer items-center gap-2.5">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(c) => field.onChange(c === true)}
                    />
                    <span className="text-sm text-ink-muted">Foil</span>
                  </label>
                </div>
              )}
            />
          </div>
        </AdminCard>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <PackagePlus className="size-4" />
          )}
          Cadastrar produto
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/produtos')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
