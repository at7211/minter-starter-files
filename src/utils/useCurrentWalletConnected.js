import { useEffect } from "react";
import { getCurrentWalletConnected } from "./interact";

export const useCurrentWalletConnected = (setter) => {
  const { setWallet, setStatus } = setter;

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  useEffect(() => {
    getCurrentWalletConnected()
      .then(({ address, status }) => {
        setWallet(address);
        setStatus(status);
        addWalletListener();
      });

  }, []);
}