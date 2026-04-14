'use client'

import { useState, type ChangeEvent } from 'react'
import { Loader2, Upload, FileText, CheckCircle2 } from 'lucide-react'
import { useCharacters } from '@/hooks/useCharacters'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/utils/api.utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CharacterKnowledgeBaseUploadResponse } from '@/types/chat.types'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = new Set(['txt', 'md', 'pdf'])
const ALLOWED_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/pdf',
])

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const getFileExtension = (fileName: string): string => {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

export default function UploadsPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth()
  const { availableCharacters, selectedCharacterId, handleCharacterChange, isLoading } = useCharacters()

  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadResult, setUploadResult] =
    useState<CharacterKnowledgeBaseUploadResponse | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    setFile(nextFile)
    setErrorMessage(null)
    setUploadResult(null)
  }

  const validateFile = (targetFile: File): string | null => {
    const extension = getFileExtension(targetFile.name)

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return 'Solo se permiten archivos .txt, .md o .pdf.'
    }

    if (targetFile.type && !ALLOWED_MIME_TYPES.has(targetFile.type)) {
      return 'El tipo MIME del archivo no es valido para este upload.'
    }

    if (targetFile.size === 0) {
      return 'El archivo esta vacio.'
    }

    if (targetFile.size > MAX_FILE_SIZE_BYTES) {
      return `El archivo supera el limite de ${MAX_FILE_SIZE_BYTES} bytes.`
    }

    return null
  }

  const handleUpload = async () => {
    if (!selectedCharacterId) {
      setErrorMessage('Selecciona un personaje antes de subir el archivo.')
      return
    }

    if (!file) {
      setErrorMessage("Debes seleccionar un archivo para continuar.")
      return
    }

    const fileValidationError = validateFile(file)
    if (fileValidationError) {
      setErrorMessage(fileValidationError)
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `/api/characters/${selectedCharacterId}/knowledge-base/upload`,
        {
          method: 'POST',
          body: formData,
        },
      )

      if (!response.ok) {
        const parsedError = await getErrorMessage(response)
        if (response.status === 403) {
          throw new Error('Forbidden: admin role required.')
        }
        throw new Error(parsedError)
      }

      const result = (await response.json()) as CharacterKnowledgeBaseUploadResponse
      setUploadResult(result)
      setFile(null)
    } catch (error) {
      const fallbackMessage = 'No se pudo subir el archivo. Intenta nuevamente.'
      setErrorMessage(error instanceof Error ? error.message : fallbackMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {isAuthLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validando permisos...
            </CardContent>
          </Card>
        ) : null}

        {!isAuthLoading && !isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">Acceso restringido</CardTitle>
              <CardDescription>
                Esta pagina de uploads solo esta disponible para usuarios con rol admin.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {isAuthLoading || !isAdmin ? null : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-serif">
              <Upload className="h-6 w-6 text-primary" />
              Uploads de Knowledge Base
            </CardTitle>
            <CardDescription>
              Pagina dedicada exclusivamente para subir archivos .txt, .md o .pdf y poblar la base vectorial del personaje.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="character-select">Personaje</Label>
              <select
                id="character-select"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                value={selectedCharacterId ?? ''}
                onChange={(event) => handleCharacterChange(event.target.value)}
                disabled={isLoading || availableCharacters.length === 0 || isUploading}
              >
                <option value="" disabled>
                  {isLoading ? 'Cargando personajes...' : 'Selecciona un personaje'}
                </option>
                {availableCharacters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kb-file">Archivo</Label>
              <Input
                id="kb-file"
                type="file"
                accept=".txt,.md,.pdf"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Limite: {MAX_FILE_SIZE_BYTES} bytes ({formatBytes(MAX_FILE_SIZE_BYTES)}).
              </p>
            </div>

            {file ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-foreground">Archivo seleccionado</p>
                <p className="text-muted-foreground">{file.name}</p>
                <p className="text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
            ) : null}

            <Button
              type="button"
              className="w-full gap-2"
              onClick={handleUpload}
              disabled={isUploading || !selectedCharacterId || !file}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo e indexando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Subir archivo
                </>
              )}
            </Button>

            {errorMessage ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
          </CardContent>
        </Card>
        )}

        {isAdmin && uploadResult ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Upload completado
              </CardTitle>
              <CardDescription>{uploadResult.message}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Archivo: {uploadResult.fileName}
              </p>
              <p>Character ID: {uploadResult.characterId}</p>
              <p>Coleccion: {uploadResult.collectionName}</p>
              <p>MIME: {uploadResult.mimeType}</p>
              <p>Chunks indexados: {uploadResult.chunksIndexed}</p>
              <p>Indexado en: {new Date(uploadResult.indexedAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  )
}
