"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { GENERIC_PLACEHOLDER_BLUR } from "@/lib/image-placeholders";

/**
 * ImageUpload - Composant drag & drop pour upload d'images
 *
 * Features :
 * - Drag & drop zone
 * - Click to upload (input file)
 * - Preview de l'image
 * - Suppression de l'image
 * - Validation format (jpg, png, webp, gif)
 * - Limite taille 5MB
 *
 * Design Byredo : Zone avec bordure en pointillés, minimal
 */

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  currentImageUrl?: string | null;
  isLoading?: boolean;
}

export default function ImageUpload({
  onImageChange,
  currentImageUrl,
  isLoading = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formats acceptés
  const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  // Valider le fichier
  const validateFile = (file: File): boolean => {
    setError(null);

    // Vérifier le format
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.");
      return false;
    }

    // Vérifier la taille
    if (file.size > MAX_SIZE) {
      setError("Fichier trop volumineux. Limite : 5MB.");
      return false;
    }

    return true;
  };

  // Gérer le fichier sélectionné
  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    // Créer la preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Remonter le fichier au parent
    onImageChange(file);
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Click to upload
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Supprimer l'image
  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {/* Zone de drag & drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? "border-black bg-black/5"
            : "border-black/20 hover:border-black/40"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      >
        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileInputChange}
          disabled={isLoading}
          className="hidden"
        />

        {/* Preview de l'image */}
        {preview ? (
          <div className="relative w-full h-64">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain p-4"
              placeholder="blur"
              blurDataURL={GENERIC_PLACEHOLDER_BLUR}
            />

            {/* Bouton supprimer */}
            {!isLoading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 bg-black text-white p-2 hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            )}

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
              </div>
            )}
          </div>
        ) : (
          // Zone d'upload vide
          <div className="p-12 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-black/40" />
                <p className="text-sm uppercase tracking-wider text-gray-400">
                  Upload en cours...
                </p>
              </div>
            ) : (
              <>
                <Upload
                  className="w-12 h-12 mx-auto mb-4 text-black/20"
                  strokeWidth={1.5}
                />
                <p className="text-sm uppercase tracking-wider text-gray-600 mb-2">
                  Cliquez ou glissez une image
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG, WEBP, GIF • Max 5MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
