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
import { useUploadProductImage } from '#/hook'
import { Loader, LoadingOverlay } from '#/components/ui/loader'

export function StoriesManagement() {
  const { data: stories, isLoading } = useStories()
  const createStory = useCreateStory()
  const updateStory = useUpdateStory()
  const deleteStory = useDeleteStory()
  const uploadImage = useUploadProductImage()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

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
    if (window.confirm('Are you sure you want to delete this story?')) {
      await deleteStory.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader variant="brand" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-dash-text tracking-tight">
            Stories Management
          </h2>
          <p className="text-dash-text-soft font-medium mt-1">
            Add, edit, and manage stories in the catalogue.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="rounded-full bg-dash-brand hover:bg-dash-brand/90 text-white font-bold px-5 h-11 flex items-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-dash-brand/10"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Story
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories?.map((story: any) => (
          <div
            key={story.id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm group"
          >
            <div className="relative h-48 bg-gray-100">
              {story.imageUrl ? (
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="text-gray-400" size={32} />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {story.tag}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-2">
                {story.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {story.excerpt}
              </p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  {story.readTime}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenModal(story)}
                    className="h-9 w-9 text-blue-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(story.id)}
                    className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-black text-gray-900">
                {editingId ? 'Edit Story' : 'Create New Story'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-900 hover:bg-gray-50 h-9 w-9 rounded-full transition-all active:scale-[0.98] cursor-pointer text-xl font-light"
              >
                &times;
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 relative min-h-[300px]">
              {uploadImage.isPending && (
                <LoadingOverlay message="Uploading cover photo..." />
              )}
              {(createStory.isPending || updateStory.isPending) && (
                <LoadingOverlay message={editingId ? "Saving story..." : "Publishing story..."} />
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Title</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. The art of the seasonal swap"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Excerpt / Short Description
                </label>
                <textarea
                  required
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="A brief summary of the story..."
                  className="w-full h-24 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-dash-brand focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Category Tag
                  </label>
                  <Input
                    required
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData({ ...formData, tag: e.target.value })
                    }
                    placeholder="e.g. Living, Hosts, Impact"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Read Time
                  </label>
                  <Input
                    required
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readTime: e.target.value })
                    }
                    placeholder="e.g. 5 min"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Cover Image
                </label>
                <div className="flex gap-4 items-center">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200"
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
                    <label
                      htmlFor="story-image-upload"
                      className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors text-sm font-bold text-gray-500"
                    >
                      {uploadImage.isPending ? (
                        <Loader variant="brand" />
                      ) : (
                        'Click to Upload Image'
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-full font-bold h-12 px-6 bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all border-none active:scale-[0.98] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createStory.isPending || updateStory.isPending || uploadImage.isPending}
                  className="bg-dash-brand hover:bg-dash-brand/90 text-white rounded-full h-12 font-extrabold px-8 shadow-lg shadow-dash-brand/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {createStory.isPending || updateStory.isPending ? (
                    <Loader variant="white" />
                  ) : editingId ? (
                    'Save Changes'
                  ) : (
                    'Publish Story'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
