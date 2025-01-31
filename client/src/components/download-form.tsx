import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { TikTokData } from "@/pages/home";
import { apiRequest } from "@/lib/queryClient";
import { validateTikTokUrl } from "@/lib/validators";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  url: validateTikTokUrl,
});

type FormSchema = z.infer<typeof formSchema>;

interface DownloadFormProps {
  onPreview: (data: TikTokData) => void;
}

export function DownloadForm({ onPreview }: DownloadFormProps) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const fetchMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/tiktok/info", { url });
      return res.json();
    },
    onSuccess: (data: TikTokData) => {
      onPreview(data);
      toast({
        title: "Video found!",
        description: "You can now download the video or audio.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: FormSchema) {
    fetchMutation.mutate(data.url);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Paste TikTok URL here..."
                  {...field}
                  className="h-12"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={fetchMutation.isPending}
        >
          {fetchMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Get Download Links"
          )}
        </Button>
      </form>
    </Form>
  );
}
