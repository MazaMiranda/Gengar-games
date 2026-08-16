'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ImageOff,
  Loader2,
  PackagePlus,
  Plus,
  Repeat2,
  Sparkles,
  Package,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Brand, Category } from '@/core/domain/entities';
import type { TcgdexMatch } from '@/infrastructure/tcgdex/client';
import {
  CARD_GRADES,
  CONDITIONS,
  PRODUCT_TYPES,
  RARITIES,
  TCG_GAMES,
  cardGradeList,
} from '@/core/domain/taxonomy';
import { AdminCard } from '@/components/admin/admin-shell';
import { CardPicker } from '@/components/admin/card-picker';
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
import { mapTcgdexRarity, productDraftSchema, type ProductDraft } from '@/lib/product-schema';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  categories: Category[];
  brands: Brand[];
}

const LANGUAGES = ['português', 'inglês', 'japonês'] as const;

/** Carta e "outro produto" preenchem campos diferentes; a escolha vem antes do formulário. */
type Mode = 'card' | 'produto';

const EMPTY_CARD: NonNullable<ProductDraft['card']> = {
  game: 'pokemon',
  tcgdexId: undefined,
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

function defaultsFor(mode: Mode, categories: Category[]): ProductDraft {
  const base = {
    name: '',
    // slug e sku saem derivados no servidor
    slug: undefined,
    sku: undefined,
    price: 0,
    compareAtPrice: null,
    stock: 0,
    tags: [],
    featured: false,
    preOrder: false,
  };

  if (mode === 'card') {
    return {
      ...base,
      type: 'tcg-card',
      // Carta é sempre Pokémon TCG nesta loja; subtítulo, descrição e marca
      // saem da própria ficha da carta, no servidor.
      categorySlug: 'pokemon-tcg',
      condition: 'novo',
      subtitle: undefined,
      description: undefined,
      brandSlug: undefined,
      card: EMPTY_CARD,
    } as ProductDraft;
  }

  return {
    ...base,
    type: 'console',
    categorySlug: categories[0]?.slug ?? '',
    condition: 'lacrado',
    subtitle: '',
    description: '',
    brandSlug: '',
    card: null,
    mediaUrls: [],
  } as ProductDraft;
}

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
  const [text, setText] = React.useState(
    value === null ? '' : (value / 100).toFixed(2).replace('.', ','),
  );

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

const MAX_PHOTOS = 4;

/**
 * Até 4 URLs de foto — sem storage de arquivo neste projeto, a loja cola o
 * link de onde a imagem já está hospedada. A primeira é a capa (o que
 * aparece no card e abre a galeria); sem nenhuma, o produto cai na arte
 * procedural do ProductVisual, como hoje.
 */
function PhotoUrlFields({
  control,
  watch,
  setValue,
  errors,
}: {
  control: Control<ProductDraft>;
  watch: UseFormWatch<ProductDraft>;
  setValue: UseFormSetValue<ProductDraft>;
  errors: FieldErrors<ProductDraft>;
}) {
  const urls = watch('mediaUrls') ?? [];

  const addRow = () => {
    if (urls.length >= MAX_PHOTOS) return;
    setValue('mediaUrls', [...urls, ''], { shouldValidate: true });
  };

  const removeRow = (index: number) => {
    setValue(
      'mediaUrls',
      urls.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-faint text-xs leading-relaxed">
        Cole o link de cada foto já hospedada (até {MAX_PHOTOS}). A primeira é a capa — a que
        aparece no card do catálogo. Sem nenhuma foto, o produto usa a arte gerada da loja.
      </p>

      {urls.length === 0 ? (
        <p className="border-line text-ink-faint rounded-md border border-dashed px-4 py-6 text-center text-xs">
          Nenhuma foto ainda — o produto vai usar a arte procedural.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {urls.map((_, index) => (
            <div key={index} className="flex items-end gap-2">
              <Field
                label={index === 0 ? 'Foto 1 · capa' : `Foto ${index + 1}`}
                error={errors.mediaUrls?.[index]?.message}
                className="flex-1"
                htmlFor={`media-url-${index}`}
              >
                <Controller
                  control={control}
                  name={`mediaUrls.${index}` as const}
                  render={({ field }) => (
                    <Input
                      id={`media-url-${index}`}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder="https://..."
                      inputMode="url"
                    />
                  )}
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remover foto ${index + 1}`}
                onClick={() => removeRow(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-fit"
        onClick={addRow}
        disabled={urls.length >= MAX_PHOTOS}
      >
        <Plus className="size-4" />
        Adicionar foto
      </Button>
    </div>
  );
}

export function ProductForm({ categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode | null>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [chosen, setChosen] = React.useState<TcgdexMatch | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductDraft>({
    resolver: zodResolver(productDraftSchema),
    defaultValues: defaultsFor('card', categories),
  });

  const isCard = mode === 'card';

  const start = (next: Mode) => {
    setMode(next);
    setChosen(null);
    reset(defaultsFor(next, categories));
    if (next === 'card') setPickerOpen(true);
  };

  /** A carta escolhida preenche tudo que a TCGdex sabe; o resto continua manual. */
  const applyCard = (match: TcgdexMatch) => {
    setChosen(match);
    setValue('name', match.name, { shouldValidate: true });
    setValue('card.tcgdexId', match.id);
    setValue('card.number', match.localId, { shouldValidate: true });
    setValue('card.set', match.setName ?? '', { shouldValidate: true });
    setValue('card.setCode', match.setCode ?? '', { shouldValidate: true });
    setValue('card.rarity', mapTcgdexRarity(match.rarity));
    setValue('card.hp', match.hp);
    setValue('card.illustrator', match.illustrator ?? '', { shouldValidate: true });
    setValue('card.cardType', match.cardType ?? '', { shouldValidate: true });
  };

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

  // ── Passo 1: o que vai ser cadastrado ────────────────────────────────────
  if (!mode) {
    return (
      <AdminCard title="O que você vai cadastrar?">
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => start('card')}
            className="group border-line bg-ink/2 hover:border-brand-400/50 hover:bg-brand-500/8 flex flex-col items-start gap-3 rounded-lg border p-6 text-left transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="border-line bg-brand-500/12 text-brand-300 group-hover:border-brand-400/50 grid size-11 place-items-center rounded-md border transition-colors">
              <Sparkles className="size-5" />
            </span>
            <span className="font-display text-ink text-base font-bold">Carta avulsa</span>
            <span className="text-ink-muted text-xs leading-relaxed">
              Busca a carta na TCGdex pelo nome. Número, coleção, raridade, ilustrador e a arte
              oficial entram sozinhos.
            </span>
          </button>

          <button
            type="button"
            onClick={() => start('produto')}
            className="group border-line bg-ink/2 hover:border-brand-400/50 hover:bg-brand-500/8 flex flex-col items-start gap-3 rounded-lg border p-6 text-left transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="border-line bg-ink/6 text-ink-muted group-hover:border-brand-400/50 grid size-11 place-items-center rounded-md border transition-colors">
              <Package className="size-5" />
            </span>
            <span className="font-display text-ink text-base font-bold">Outro produto</span>
            <span className="text-ink-muted text-xs leading-relaxed">
              Produto selado, console, jogo, acessório ou colecionável — preenchido à mão.
            </span>
          </button>
        </div>
      </AdminCard>
    );
  }

  return (
    <>
      <CardPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={applyCard} />

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <button
          type="button"
          onClick={() => setMode(null)}
          className="text-ink-faint hover:text-ink -my-1 inline-flex w-fit items-center gap-2 py-1 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Trocar o tipo de cadastro
        </button>

        {isCard ? (
          <AdminCard title="Carta">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="border-line bg-ink/4 relative aspect-[5/7] w-32 shrink-0 overflow-hidden rounded-md border">
                {chosen?.imageUrl ? (
                  <Image src={chosen.imageUrl} alt={chosen.name} fill className="object-cover" />
                ) : (
                  <span className="text-ink-ghost grid h-full place-items-center">
                    <ImageOff className="size-6" />
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {chosen ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <p className="font-display text-ink text-lg font-bold">{chosen.name}</p>
                      <p className="text-ink-muted text-xs">
                        {[chosen.setName, chosen.localId, chosen.rarity]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <p className="text-ink-faint text-xs">
                      A arte oficial acima entra como foto do produto na loja.
                    </p>
                  </>
                ) : (
                  <p className="text-ink-muted text-sm">
                    Nenhuma carta escolhida ainda. A busca preenche nome, número, coleção, raridade,
                    ilustrador e a arte.
                  </p>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-fit"
                  onClick={() => setPickerOpen(true)}
                >
                  <Repeat2 className="size-4" />
                  {chosen ? 'Trocar carta' : 'Buscar carta na TCGdex'}
                </Button>
                {errors.name ? <p className="text-danger text-xs">{errors.name.message}</p> : null}
              </div>
            </div>
          </AdminCard>
        ) : (
          <AdminCard title="Identificação">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nome" required error={errors.name?.message} htmlFor="name">
                <Input id="name" {...register('name')} placeholder="PlayStation 5 Slim" />
              </Field>

              <Field label="Subtítulo" required error={errors.subtitle?.message} htmlFor="subtitle">
                <Input
                  id="subtitle"
                  {...register('subtitle')}
                  placeholder="1TB · versão com leitor"
                />
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
        )}

        <AdminCard title="Classificação">
          <div className="grid gap-5 md:grid-cols-2">
            {isCard ? (
              <Field label="Tipo de produto" hint="Definido pelo tipo de cadastro escolhido.">
                <Input value={PRODUCT_TYPES['tcg-card']} disabled />
              </Field>
            ) : (
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
                        {Object.entries(PRODUCT_TYPES)
                          .filter(([value]) => value !== 'tcg-card')
                          .map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}

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

            {!isCard ? (
              <Field label="Marca" required error={errors.brandSlug?.message}>
                <Controller
                  control={control}
                  name="brandSlug"
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
            ) : null}
          </div>
        </AdminCard>

        <AdminCard title="Preço e estoque">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Preço (R$)" required error={errors.price?.message} htmlFor="price">
              <Controller
                control={control}
                name="price"
                render={({ field }) => (
                  <MoneyInput
                    id="price"
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? 0)}
                  />
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
              <Input
                id="stock"
                type="number"
                min={0}
                {...register('stock', { valueAsNumber: true })}
              />
            </Field>
          </div>

          <div className="border-line mt-6 flex flex-wrap gap-6 border-t pt-5">
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2.5">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                  <span className="text-ink-muted text-sm">Produto em destaque</span>
                </label>
              )}
            />
            <Controller
              control={control}
              name="preOrder"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2.5">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                  <span className="text-ink-muted text-sm">Pré-venda</span>
                </label>
              )}
            />
          </div>
        </AdminCard>

        {!isCard ? (
          <AdminCard title="Fotos do produto">
            <PhotoUrlFields control={control} watch={watch} setValue={setValue} errors={errors} />
          </AdminCard>
        ) : null}

        {isCard ? (
          <AdminCard title="Ficha da carta">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Card game" hint="A loja cadastra só cartas de Pokémon TCG.">
                <Input value={TCG_GAMES.pokemon.name} disabled />
              </Field>

              <Field label="Coleção" required error={errors.card?.set?.message} htmlFor="card-set">
                <Input id="card-set" {...register('card.set')} placeholder="Obsidian Flames" />
              </Field>

              <Field
                label="Código"
                required
                error={errors.card?.setCode?.message}
                htmlFor="card-code"
              >
                <Input id="card-code" {...register('card.setCode')} placeholder="OBF" />
              </Field>

              <Field
                label="Número"
                required
                error={errors.card?.number?.message}
                htmlFor="card-number"
              >
                <Input id="card-number" {...register('card.number')} placeholder="223" />
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

              {/* A escala de conservação: NM, SP, MP e D. */}
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

              <Field
                label="Tipo da carta"
                required
                error={errors.card?.cardType?.message}
                htmlFor="card-type"
              >
                <Input id="card-type" {...register('card.cardType')} placeholder="Pokémon · Fogo" />
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
                      <span className="text-ink-muted text-sm">Foil</span>
                    </label>
                  </div>
                )}
              />
            </div>
          </AdminCard>
        ) : null}

        <div className={cn('flex flex-wrap items-center gap-3')}>
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
    </>
  );
}
