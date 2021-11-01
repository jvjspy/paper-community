import useSnackbar from "hooks/useSnackbar";
import http from "lib/http";
import { MutationConfig, QueryConfig } from "lib/react-query";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Follow } from "../types";

type NormalizedFollow = Record<
  "user" | "tag",
  Record<string, string | undefined>
>;
function normalizeFollow(follows: Follow[]) {
  const res: NormalizedFollow = { tag: {}, user: {} };
  follows.forEach((f) => {
    res[f.followableType][f.followableId] = f.id;
  });
  return res;
}
function fetchUserFollows(): Promise<Follow[]> {
  return http.get("/follows");
}
export function useFollow(config?: QueryConfig<typeof normalizeFollow>) {
  return useQuery({
    queryKey: "follow",
    queryFn: () =>
      fetchUserFollows().then((follows) => normalizeFollow(follows)),
    ...config,
  });
}
function createFollow(data: Omit<Follow, "id">): Promise<Follow> {
  return http.post("/follows", data);
}
function unFollow(id: string) {
  return http.delete(`/follows/${id}`);
}
export function useCreateFollow(config?: MutationConfig<typeof createFollow>) {
  const { success } = useSnackbar();
  const client = useQueryClient();
  return useMutation({
    mutationFn: createFollow,
    onSuccess: async () => {
      await client.invalidateQueries("follow");
      success("Following");
    },
    ...config,
  });
}
export function useUnfollow(config?: MutationConfig<typeof unFollow>) {
  const { success } = useSnackbar();
  const client = useQueryClient();
  return useMutation({
    mutationFn: unFollow,
    onSuccess: async () => {
      await client.invalidateQueries("follow");
      success("Unfollowed");
    },
    ...config,
  });
}
