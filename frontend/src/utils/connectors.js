import { InjectedConnector } from '@web3-react/injected-connector';

export const injected = new InjectedConnector({
  supportedChainIds: [1337, 31337], // Add your network chain IDs here
});

export const connectors = {
  injected: injected,
}; 