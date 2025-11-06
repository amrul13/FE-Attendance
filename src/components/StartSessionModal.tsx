import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";

import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";



interface Theme {
  id: number;
  name: string;
}

interface StartSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartSessionModal({
  open,
  onOpenChange,
}: StartSessionModalProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [sessionCode, setSessionCode] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [openThemeList, setOpenThemeList] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (open) {
      fetch("https://localhost:8000/themes")
        .then((res) => res.json())
        .then((data) => setThemes(data))
        .catch(console.error);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!sessionCode || !selectedTheme) {
      alert("Please fill in all fields.");
      return;
    }

    const res = await fetch("https://localhost:8000/attendance/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_code: sessionCode,
        theme_id: selectedTheme.id,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      alert("Attendance session started!");
      setSessionCode("");
      setSelectedTheme(null);
      onOpenChange(false);

      // ⬇️ arahkan ke halaman attendanceSession dengan session_code
      navigate(`/attendance/${data.id}`);
    } else {
      alert("Failed to start session.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Attendance Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Session Code Input */}
          <div className="grid gap-2">
            <Label htmlFor="sessionCode">Session Code</Label>
            <Input
              id="sessionCode"
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
            />
          </div>

          {/* Searchable Combobox */}
          <div className="grid gap-2">
            <Label>Select Theme</Label>
            <Popover open={openThemeList} onOpenChange={setOpenThemeList}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openThemeList}
                  className="w-full justify-between"
                >
                  {selectedTheme ? selectedTheme.name : "Select theme..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search themes..." />
                  <CommandList>
                    <CommandEmpty>No theme found.</CommandEmpty>
                    {themes.map((theme) => (
                      <CommandItem
                        key={theme.id}
                        value={theme.name}
                        onSelect={() => {
                          setSelectedTheme(theme);
                          setOpenThemeList(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTheme?.id === theme.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {theme.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Start Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
