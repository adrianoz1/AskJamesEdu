"use client";

import { useEffect, useMemo, useState } from "react";
import { Mutex, tryAcquire } from "async-mutex";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

import { supabaseClient } from "../lib/supabaseClient";
import useUser from "@/hooks/useUser";

const mutex = new Mutex();

export default function Chat() {
  library.add(fab);
  library.add(fas);

  const prompts = [
    `O que é o verbo TO BE?`,
    `Explique o simple present`,
    `Diferença entre Present Perfect e Present Perfect Continuos`,
    `Quando usar o Do, Does, Was, Were e Did?`,
    `Quando usar Will e Going to?`,
    `Lista dos 10 verbos irregulares mais usados`,
  ];

  const [isLoading, setIsLoading] = useState(false); // Display spinner
  const [generatedReply, setGeneratedReply] = useState("");
  const [prompt, setPrompt] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [userEmail, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [validEmail, setValidEmail] = useState(false);

  const { user, isLoadingUser, token } = useUser();

  const isEmailValid = (key: string) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(key);
  };

  useEffect(() => {
    if (user && !isLoadingUser) {
      setValidEmail(true);
      setEmail(user.email);
    }
  }, [user, isLoadingUser]);

  const keyModal = useMemo(
    () => (
      <div
        className={`modal modal-large modal-animated--zoom-in ${
          modalVisible ? `modal--visible` : ``
        }`}
        id="basic-modal"
      >
        <a
          onClick={() => setModalVisible(false)}
          className="modal-overlay close-btn"
          href="#"
          aria-label="Close"
        />
        <div className="modal-content">
          <div className="modal-body">
            <div className="u-flex u-items-center u-justify-space-between mb-2">
              <div className="tracking-tight">
                <h6 className="m-0">Informe o seu e-mail</h6>
              </div>
              <a
                onClick={() => setModalVisible(false)}
                className=""
                aria-label="Close"
              >
                <FontAwesomeIcon icon={["fas", "close"]}></FontAwesomeIcon>
              </a>
            </div>
            <div className="form-group">
              <input
                className="form-group-input"
                type="text"
                placeholder="Seu e-mail válido"
                defaultValue={userEmail}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <button
                className="form-group-btn btn-primary"
                onClick={(e) => {
                  if (!isEmailValid(userEmail)) {
                    alert(`Informe um e-mail válido!`);
                    return;
                  }
                  handleLogin(userEmail);
                }}
              >
                Salvar
              </button>
            </div>
            <span className="info"></span>
          </div>
        </div>
      </div>
    ),
    [modalVisible, userEmail]
  );

  const handleLogin = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_APP_REDIRECT ?? "http://localhost:3000",
        },
      });
      if (error) throw error;
      alert("Verifique seu e-mail 🪄✨");
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReplySync = async (e: any, p?: string) => {
    try {
      await tryAcquire(mutex).runExclusive(
        async () => await generateReply(e, p)
      );
    } catch (e) {}
  };

  const generateReply = async (e: any, p?: string) => {
    e.preventDefault();

    if (!p && (!promptInput || promptInput.trim().length === 0)) {
      console.error("Must provide a prompt");
      alert("Must provide a prompt");
      return;
    }

    if (!userEmail && (!userEmail || userEmail.trim().length === 0)) {
      console.error("Informe seu e-mail para continuar");
      alert("Informe seu e-mail para continuar");
      return;
    }
    setPromptInput(p as string);

    setIsLoading(true);
    setGeneratedReply("");

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${p ?? promptInput}`,
        authUID: user?.id
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      setIsLoading(false);
      setPrompt(promptInput);
      setGeneratedReply(error);

      // throw new Error(response.statusText);
      return;
    }

    setPrompt(p ?? promptInput);
    setIsLoading(false);

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();

    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedReply((prev) => prev + chunkValue);
    }
  };

  return (
    <div className="u-flex u-flex-column u-items-center u-justify-center w-100p px-2">
      {!validEmail && keyModal}
      <div className="form-group w-100p w-70p-md max-w-sm u-shadow-sm mb-4">
        <input
          className="form-group-input"
          placeholder="Digite aqui sua pergunta ao James Edu"
          type="text"
          name="promptInput"
          onChange={(e) => setPromptInput(e.target.value)}
          value={promptInput ?? ``}
          onKeyUp={(e) => {
            if (e.key === `Enter`) {
              generateReplySync(e);
            }
          }}
        />
      </div>
      {!validEmail && (
        <div className="u-border-1 border-red-300 bg-red-200 u-round-md p-2">
          Por favor informe seu e-mail antes de perguntar ao James Edu.{" "}
          <button
            className="btn-primary btn--sm m-0 ml-2"
            onClick={(e) => setModalVisible(true)}
          >
            Informar
          </button>
        </div>
      )}

      <div className="u-flex w-100p max-w-md flex-col u-gap-2">
        {isLoading ? (
          <div className="u-center animated loading p-1"></div>
        ) : (
          prompt && (
            <div className="w-100p u-text-center p-4 u-round-sm u-shadow-sm bg-white u-bg-opacity-60">
              <p className="text-gray-700 text-lg m-0">{generatedReply}</p>
            </div>
          )
        )}
      </div>

      {userEmail && validEmail && isEmailValid(userEmail) && (
        <div className="my-2 max-w-sm">
          <p className="text-sm text-gray-300 mb-0 u-text-center">
            Não sabe o que perguntar? Tente as seguintes perguntas
          </p>
          <div className="row">
            {prompts.map((p, i) => (
              <div className="col-6 mb-1" key={i}>
                <div
                  className="u-round-md bg-white u-bg-opacity-50 px-2 py-1 u-shadow-xs hover-grow"
                  onClick={(e) => {
                    setTimeout(() => {
                      generateReplySync(e, p);
                    }, 200);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <p className="suggestion m-0 text-sm u-overflow-hidden u-flex-nowrap">
                    {p}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
