"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadReceipt } from "@/lib/hooks/useReceipts";
import { Upload, FileImage, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadDropzone() {
    const [preview, setPreview] = useState(null);
    const { mutate: upload, isPending, isSuccess, isError, reset } = useUploadReceipt();

    const onDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) return;

            if (file.type.startsWith("image/")) {
                setPreview(URL.createObjectURL(file));
            }

            upload(file, {
                onSuccess: () => {
                    setTimeout(() => {
                        setPreview(null);
                        reset();
                    }, 3000);
                },
                onError: () => {
                    setTimeout(() => {
                        setPreview(null);
                        reset();
                    }, 3000);
                },
            });
        },
        [upload, reset]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/webp": [],
            "application/pdf": [],
        },
        maxFiles: 1,
        disabled: isPending,
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Upload receipt</h2>

            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                    isDragActive
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50",
                    isPending && "pointer-events-none opacity-70"
                )}
            >
                <input {...getInputProps()} />

                {isPending ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-600">AI is extracting data...</p>
                        <p className="text-xs text-gray-400">This may take a few seconds</p>
                    </div>
                ) : isSuccess ? (
                    <div className="flex flex-col items-center gap-3">
                        <CheckCircle size={40} className="text-green-500" />
                        <p className="text-sm text-green-600 font-medium">Receipt processed successfully</p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={40} className="text-red-500" />
                        <p className="text-sm text-red-600 font-medium">Processing failed — try again</p>
                    </div>
                ) : preview ? (
                    <div className="flex flex-col items-center gap-3">
                        <img src={preview} alt="Receipt preview" className="max-h-40 rounded-lg object-contain" />
                        <p className="text-xs text-gray-400">Ready to upload</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Upload size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                {isDragActive ? "Drop your receipt here" : "Drag & drop your receipt"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                or click to browse · JPEG, PNG, PDF
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}