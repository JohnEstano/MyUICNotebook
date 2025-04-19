import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { UserRoundPlus } from "lucide-react";

interface Notebook {
  id: number;
  name: string;
  users: { id: number; name: string; email: string; pivot?: { permission: string } }[];
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface NotebookShareDialogProps {
  notebook: Notebook;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchResults: User[];
  handleShare: (user: User, permission: string, notebookId: number) => void;
  triggerElement: React.ReactNode;
}

export function NotebookShareDialog({
  notebook,
  searchTerm,
  setSearchTerm,
  searchResults,
  handleShare,
  triggerElement
}: NotebookShareDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Share Notebook</DialogTitle>
          <DialogDescription>
            Add or remove collaborators for this notebook.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            placeholder="Search users…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Collaborators */}
          {notebook.users.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium">People with Access</p>
              {notebook.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {user.pivot?.permission === "owner" ? (
                    <span className="text-sm font-medium">Owner</span>
                  ) : (
                    <Select
                      value={user.pivot?.permission || "viewer"}
                      onValueChange={(value) => handleShare(user, value, notebook.id)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Permission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Can view</SelectItem>
                        <SelectItem value="editor">Can edit</SelectItem>
                        <SelectItem value="remove">Remove</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchTerm.trim() !== "" && (
            <div className="space-y-2 pt-4">
              <p className="text-sm font-medium">Search Results</p>
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Select
                      onValueChange={(value) => handleShare(user, value, notebook.id)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Permission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Can view</SelectItem>
                        <SelectItem value="editor">Can edit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No users found.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
