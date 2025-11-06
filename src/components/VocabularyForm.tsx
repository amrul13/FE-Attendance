// components/VocabularyForm.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Save, Check, ChevronsUpDown, Plus } from "lucide-react";
import type {
  VocabularyFormData,
  VocabularySearchResult,
} from "@/types/vocabulary";

import { cn } from "@/lib/utils";

interface VocabularyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VocabularyFormData) => Promise<void>;
  initialData?: VocabularyFormData | null;
  isEditing?: boolean;
  loading?: boolean;
  themeId?: string;
}

const API_BASE_URL = "https://localhost:8000";

const VocabularyForm: React.FC<VocabularyFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  loading = false,
  themeId,
}) => {
  // Form states
  const [formData, setFormData] = useState<VocabularyFormData>({
    word: "",
    meaning: "",
  });
  const [errors, setErrors] = useState<{ word?: string; meaning?: string }>({});

  // Combobox states
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Search states - SEMUA DALAM KOMPONEN
  const [searchResults, setSearchResults] = useState<VocabularySearchResult[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Reset form ketika modal dibuka/ditutup
  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData || {
          word: "",
          meaning: "",
        }
      );
      setSearchQuery(initialData?.word || "");
      setErrors({});
      setSearchResults([]);
      setSearchLoading(false);
    }
  }, [isOpen, initialData]);

  // Handle search dengan debounce
  useEffect(() => {
    if (!isOpen || isEditing) return;

    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen, isEditing]);

  // Function search - DALAM KOMPONEN
  const handleSearch = async (query: string) => {
    setSearchLoading(true);

    try {
      const url = themeId
        ? `${API_BASE_URL}/vocabularies/search?q=${encodeURIComponent(
            query
          )}&theme_id=${themeId}`
        : `${API_BASE_URL}/vocabularies/search?q=${encodeURIComponent(query)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Search failed: Status ${response.status}`);
      }

      const results: VocabularySearchResult[] = await response.json();
      setSearchResults(results);
    } catch (err) {
      // Silent error untuk UX yang better
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { word?: string; meaning?: string } = {};

    if (!formData.word.trim()) {
      newErrors.word = "Word is required";
    } else if (formData.word.trim().length < 2) {
      newErrors.word = "Word must be at least 2 characters long";
    }

    if (!formData.meaning.trim()) {
      newErrors.meaning = "Meaning is required";
    } else if (formData.meaning.trim().length < 2) {
      newErrors.meaning = "Meaning must be at least 2 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleComboboxSelect = (vocab: VocabularySearchResult) => {
    setFormData({
      word: vocab.word,
      meaning: vocab.meaning,
    });
    setSearchQuery(vocab.word);
    setIsComboboxOpen(false);
    setSearchResults([]);
  };

  const handleComboboxInputChange = (value: string) => {
    setSearchQuery(value);

    // Jika user mengetik manual, update formData juga
    if (
      !searchResults.some(
        (result) => result.word.toLowerCase() === value.toLowerCase()
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        word: value,
      }));
    }

    if (errors.word) {
      setErrors((prev) => ({ ...prev, word: undefined }));
    }
  };

  const handleCreateNew = () => {
    // User memilih untuk create new vocabulary dengan kata yang diketik
    setFormData((prev) => ({
      ...prev,
      word: searchQuery,
    }));
    setIsComboboxOpen(false);
    setSearchResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Vocabulary" : "Add New Vocabulary"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Word Field dengan Combobox */}
          <div className="space-y-2">
            <Label htmlFor="word">Word (English) *</Label>
            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
              <PopoverTrigger asChild disabled={isEditing}>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isComboboxOpen}
                  className={cn(
                    "w-full justify-between",
                    !formData.word && "text-muted-foreground",
                    errors.word && "border-red-500"
                  )}
                >
                  {formData.word || "Select or type a word..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search words..."
                    value={searchQuery}
                    onValueChange={handleComboboxInputChange}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {searchLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Searching...
                        </div>
                      ) : searchQuery.length >= 2 ? (
                        <div className="py-6 text-center text-sm">
                          <p>No vocabulary found for "{searchQuery}"</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={handleCreateNew}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create "{searchQuery}"
                          </Button>
                        </div>
                      ) : (
                        "Type at least 2 characters to search..."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {searchResults.map((vocab) => (
                        <CommandItem
                          key={vocab.id}
                          value={vocab.word}
                          onSelect={() => handleComboboxSelect(vocab)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex flex-col flex-1">
                            <span className="font-medium">{vocab.word}</span>
                            <span className="text-sm text-muted-foreground italic">
                              {vocab.meaning}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {vocab.exists_in_current_theme && (
                              <Badge variant="secondary" className="text-xs">
                                In this theme
                              </Badge>
                            )}
                            {vocab.exists_in_current_theme ? (
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <Plus className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>

                    {/* Create New Option */}
                    {searchQuery.length >= 2 && searchResults.length > 0 && (
                      <CommandGroup>
                        <CommandItem
                          onSelect={handleCreateNew}
                          className="cursor-pointer"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create new: "{searchQuery}"
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.word && (
              <p className="text-sm text-red-600">{errors.word}</p>
            )}
            {!isEditing && (
              <p className="text-sm text-muted-foreground">
                Select from existing vocabularies or create a new one
              </p>
            )}
          </div>

          {/* Meaning Field */}
          <div className="space-y-2">
            <Label htmlFor="meaning">Meaning (Indonesian) *</Label>
            <Textarea
              id="meaning"
              value={formData.meaning}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, meaning: e.target.value }));
                if (errors.meaning) {
                  setErrors((prev) => ({ ...prev, meaning: undefined }));
                }
              }}
              disabled={loading}
              placeholder="Enter meaning in Indonesian"
              className={cn(
                "min-h-[100px] resize-none",
                errors.meaning && "border-red-500"
              )}
            />
            {errors.meaning && (
              <p className="text-sm text-red-600">{errors.meaning}</p>
            )}
          </div>

          {/* Current Selection Info */}
          {formData.word && (
            <div
              className={cn(
                "p-3 rounded-lg border",
                errors.word
                  ? "border-red-200 bg-red-50"
                  : "border-blue-200 bg-blue-50"
              )}
            >
              <p className="text-sm font-medium">
                Selected: <span className="font-bold">{formData.word}</span>
              </p>
              {formData.meaning && (
                <p className="text-sm mt-1 italic">
                  Meaning: {formData.meaning}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.word || !formData.meaning}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? "Update" : "Add Vocabulary"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VocabularyForm;
