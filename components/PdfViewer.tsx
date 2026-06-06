'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


interface PdfViewerProps {
  fileUrl: string;
}

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <div className="pdf-viewer-container bg-gray-200 p-4 rounded-lg">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div className="text-center">A carregar PDF...</div>}
        error={<div className="text-center text-red-500">Erro ao carregar PDF.</div>}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <div className="flex justify-center items-center mt-4">
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={previousPage}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-l-md disabled:opacity-50"
        >
          Anterior
        </button>
        <p className="px-4 py-2 bg-gray-100 text-gray-800">
          Página {pageNumber} de {numPages}
        </p>
        <button
          type="button"
          disabled={pageNumber >= (numPages || 0)}
          onClick={nextPage}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-r-md disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
