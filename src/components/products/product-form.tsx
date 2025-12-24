'use client'

import { useActionState, useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '@/lib/constants'
import { uploadProductImage, deleteProductImage } from '@/actions/upload'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { Product } from '@/types'

interface ProductFormProps {
  product?: Product
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | void>
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEdit ? 'Update Product' : 'Create Product'}
    </Button>
  )
}

export function ProductForm({ product, action }: ProductFormProps) {
  const [state, formAction] = useActionState(action, null)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadError(null)
    const newImages = [...images]

    for (const file of Array.from(files)) {
      if (newImages.length >= 5) break

      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadProductImage(formData)
      if (result.error) {
        setUploadError(result.error)
        break
      }
      if (result.url) {
        newImages.push(result.url)
      }
    }

    setImages(newImages)
    setUploading(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index]
    await deleteProductImage(imageUrl)
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {(state?.error || uploadError) && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {state?.error || uploadError}
        </div>
      )}

      {/* Images */}
      <div className="space-y-2">
        <Label>Product Images</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={image}
                alt={`Product ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Add Image</span>
                </>
              )}
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Upload up to 5 images. Max 5MB each. JPG, PNG, or WebP.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={product?.title}
          placeholder="Product title"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          placeholder="Describe your product..."
          rows={5}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price}
            placeholder="0.00"
            required
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            defaultValue={product?.quantity || 1}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={product?.category} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select name="condition" defaultValue={product?.condition} required>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CONDITIONS.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <SubmitButton isEdit={!!product} />
      </div>
    </form>
  )
}
