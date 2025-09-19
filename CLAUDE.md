# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Development:
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## Architecture

This is a React TypeScript web application for batch image processing with watermarking capabilities.

### Core Structure

- **App.tsx** - Main application component containing all state management and core logic
  - Manages image collection with deduplication (using simple hash)
  - Handles editor settings and real-time preview generation
  - Controls processing workflow and ZIP download functionality

- **types.ts** - TypeScript interfaces for the entire application
  - `ImageInfo` - represents an uploaded image with original/processed sources
  - `EditorSettings` - comprehensive settings for image processing options
  - `TextWatermark`/`ImageWatermark` - watermark configuration objects

- **utils/imageProcessor.ts** - Core image processing logic using HTML5 Canvas
  - Handles rotation, filters (brightness/contrast/saturation), noise addition
  - Applies text and image watermarks with positioning
  - Exports images in JPEG/PNG/WebP formats with quality control

### Component Architecture

Components are organized in a `/components` directory:
- **ControlsPanel** - Left sidebar with all editing controls and processing options
- **ImageDropzone** - Drag-and-drop interface for initial image upload
- **ImageGrid** - Right sidebar showing thumbnail grid with selection/reordering
- **MainPreview** - Center area displaying selected image with real-time preview
- **ImagePreview** - Individual image thumbnail component
- **Modal** - Generic modal component for dialogs

### Key Features

- **Image Deduplication**: Uses simple hash function to prevent duplicate uploads
- **Real-time Preview**: Processes preview with 200ms debounce using `setTimeout`
- **Batch Processing**: Processes all images with progress tracking
- **Watermarking**: Supports both text and image watermarks with opacity/positioning
- **Export**: Creates ZIP archive using JSZip with numbered filenames
- **Drag Reordering**: Images can be reordered in the grid

### State Management

All state is managed in App.tsx using React hooks:
- `images` - Array of ImageInfo objects
- `selectedImageId` - Currently selected image for preview
- `previewSrc` - Generated preview data URL
- `hashes` - Set for deduplication tracking
- `editorSettings` - Complete editor configuration object

### Processing Pipeline

1. Files uploaded → deduplication check → add to images array
2. Image selected → debounced preview generation via `processImage()`
3. Batch process → all images processed with progress tracking
4. Download → ZIP creation with processed or original images