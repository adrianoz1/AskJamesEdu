import { useState, useEffect } from "react";
import { supabaseClient } from "../lib/supabaseClient";

const useUser = () => {
  const [user, setUser] = useState<any>();
  const [isLoadingUser, setLoadingUser] = useState<boolean>(true);
  const [token, setToken] = useState<string>();

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session?.user.id) {
        setUser(data.session?.user);
        setToken(data.session?.access_token);
      }
      setLoadingUser(false);

    })

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        setUser(session.user);
        setToken(session.access_token);
      }
      setLoadingUser(false);
    });

  }, [supabaseClient]);

  return {
    user,
    isLoadingUser,
    token,
  };
};
export default useUser;
