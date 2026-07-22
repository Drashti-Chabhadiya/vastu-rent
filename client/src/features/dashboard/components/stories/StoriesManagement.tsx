import { useState } from 'react'
import {
  useStories,
  useCreateStory,
  useUpdateStory,
  useDeleteStory,
} from '#/hook/use-stories'
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import { useUploadProductImage } from '#/hook'
import { Loader, LoadingOverlay } from '#/components/ui/loader'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

import { useTranslation } from '#/context/TranslationContext'

export function StoriesManagement() {
  const { t } = useTranslation()
  const { data: stories, isLoading } = useStories()
  const createStory = useCreateStory()
  const updateStory = useUpdateStory()
  const deleteStory = useDeleteStory()
  const uploadImage = useUploadProductImage()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    tag: '',
    readTime: '',
    imageUrl: '',
  })

  const handleOpenModal = (story?: any) => {
    if (story) {
      setEditingId(story.id)
      setFormData({
        title: story.title,
        excerpt: story.excerpt,
        tag: story.tag,
        readTime: story.readTime,
        imageUrl: story.imageUrl,
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        excerpt: '',
        tag: '',
        readTime: '',
        imageUrl: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadImage.mutateAsync(file)
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }))
      }
    } catch (error) {
      console.error('Upload failed', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await updateStory.mutateAsync({ id: editingId, data: formData })
    } else {
      await createStory.mutateAsync(formData)
    }
    handleCloseModal()
  }

  const handleDelete = async (id: string) => {
    setStoryToDelete(id)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader variant="brand" size={32} />
      </div>
    )
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-black text-dash-text tracking-tight">
            {t('Catalogue Stories')}
          </h2>
          <p className="text-dash-text-soft font-medium mt-1">
            {t('Add, edit, and manage stories in the catalogue.')}
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="rounded-full bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground font-bold px-5 h-11 flex items-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-dash-brand/10"
        >
          <Plus size={16} strokeWidth={2.5} />
          {t('Create Story')}
        </Button>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {stories?.map((story: any) => (
          <div
            key={story.id}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm group"
          >
            <div className="relative h-48 bg-muted/50">
              {story.imageUrl ? (
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="text-muted-foreground/70" size={32} />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-card/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {story.tag}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-bold text-lg text-foreground leading-tight mb-2 line-clamp-2">
                {story.title}
              </h3>
              <p className="text-muted-foreground/85 text-sm line-clamp-2 mb-4">
                {story.excerpt}
              </p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <span className="text-xs font-bold text-muted-foreground/70 uppercase">
                  {story.readTime}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenModal(story)}
                    className="h-9 w-9 text-info-foreground hover:bg-info hover:text-info-foreground rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(story.id)}
                    className="h-9 w-9 text-destructive hover:bg-danger hover:text-destructive rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-border/30 flex justify-between items-center sticky top-0 bg-card z-10">
              <h3 className="text-xl font-black text-foreground">
                {editingId ? t('Edit Story') : t('Create New Story')}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="text-muted-foreground/70 hover:text-foreground hover:bg-muted-light h-9 w-9 rounded-full transition-all active:scale-[0.98] cursor-pointer text-xl font-light"
              >
                &times;
              </Button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 relative min-h-[300px]"
            >
              {uploadImage.isPending && (
                <LoadingOverlay message={t('Uploading cover photo...')} />
              )}
              {(createStory.isPending || updateStory.isPending) && (
                <LoadingOverlay
                  message={
                    editingId ? t('Saving story...') : t('Publishing story...')
                  }
                />
              )}

              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground/80">
                  {t('Title')}
                </Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder={t('e.g. The art of the seasonal swap')}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground/80">
                  {t('Excerpt / Short Description')}
                </Label>
                <Textarea
                  required
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder={t('A brief summary of the story...')}
                  className="w-full h-24 p-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-dash-brand focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground/80">
                    {t('Category Tag')}
                  </Label>
                  <Input
                    required
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData({ ...formData, tag: e.target.value })
                    }
                    placeholder={t('e.g. Living, Hosts, Impact')}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground/80">
                    {t('Read Time')}
                  </Label>
                  <Input
                    required
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readTime: e.target.value })
                    }
                    placeholder={t('e.g. 5 min')}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground/80">
                  {t('Cover Image')}
                </Label>
                <div className="flex gap-4 items-center">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border border-border"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="story-image-upload"
                    />
                    <Label
                      htmlFor="story-image-upload"
                      className="flex items-center justify-center w-full h-20 border-2 border-dashed border-border/120 rounded-xl hover:bg-muted-light cursor-pointer transition-colors text-sm font-bold text-muted-foreground/85"
                    >
                      {uploadImage.isPending ? (
                        <Loader variant="brand" />
                      ) : (
                        t('Click to Upload Image')
                      )}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border/30">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-full font-bold h-12 px-6 bg-muted text-muted-foreground hover:bg-muted-dark/20 transition-all border-none active:scale-[0.98] cursor-pointer"
                >
                  {t('Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createStory.isPending ||
                    updateStory.isPending ||
                    uploadImage.isPending
                  }
                  className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground rounded-full h-12 font-extrabold px-8 shadow-lg shadow-dash-brand/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {createStory.isPending || updateStory.isPending ? (
                    <Loader variant="white" />
                  ) : editingId ? (
                    t('Save Changes')
                  ) : (
                    t('Publish Story')
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ReusableAlertDialog
        isOpen={storyToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setStoryToDelete(null)
        }}
        onConfirm={async () => {
          if (storyToDelete) {
            await deleteStory.mutateAsync(storyToDelete)
            setStoryToDelete(null)
          }
        }}
        title="Delete Story"
        description="Are you sure you want to permanently delete this story? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </motion.div>
  )
}
