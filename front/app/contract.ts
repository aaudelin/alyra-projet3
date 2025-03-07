export const contract = {
  address: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x") as `0x${string}`,
  abi: [
    {
      type: "constructor",
      inputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "addProposal",
      inputs: [
        {
          name: "_desc",
          type: "string",
          internalType: "string",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "addVoter",
      inputs: [
        {
          name: "_addr",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "endProposalsRegistering",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "endVotingSession",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getOneProposal",
      inputs: [
        {
          name: "_id",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          name: "",
          type: "tuple",
          internalType: "struct Voting.Proposal",
          components: [
            {
              name: "description",
              type: "string",
              internalType: "string",
            },
            {
              name: "voteCount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getVoter",
      inputs: [
        {
          name: "_addr",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [
        {
          name: "",
          type: "tuple",
          internalType: "struct Voting.Voter",
          components: [
            {
              name: "isRegistered",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "hasVoted",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "votedProposalId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "owner",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "address",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "renounceOwnership",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setVote",
      inputs: [
        {
          name: "_id",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "startProposalsRegistering",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "startVotingSession",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "tallyVotes",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "transferOwnership",
      inputs: [
        {
          name: "newOwner",
          type: "address",
          internalType: "address",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "winningProposalID",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "workflowStatus",
      inputs: [],
      outputs: [
        {
          name: "",
          type: "uint8",
          internalType: "enum Voting.WorkflowStatus",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "event",
      name: "OwnershipTransferred",
      inputs: [
        {
          name: "previousOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "newOwner",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "ProposalRegistered",
      inputs: [
        {
          name: "proposalId",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "Voted",
      inputs: [
        {
          name: "voter",
          type: "address",
          indexed: false,
          internalType: "address",
        },
        {
          name: "proposalId",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "VoterRegistered",
      inputs: [
        {
          name: "voterAddress",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "WorkflowStatusChange",
      inputs: [
        {
          name: "previousStatus",
          type: "uint8",
          indexed: false,
          internalType: "enum Voting.WorkflowStatus",
        },
        {
          name: "newStatus",
          type: "uint8",
          indexed: false,
          internalType: "enum Voting.WorkflowStatus",
        },
      ],
      anonymous: false,
    },
    {
      type: "error",
      name: "OwnableInvalidOwner",
      inputs: [
        {
          name: "owner",
          type: "address",
          internalType: "address",
        },
      ],
    },
    {
      type: "error",
      name: "OwnableUnauthorizedAccount",
      inputs: [
        {
          name: "account",
          type: "address",
          internalType: "address",
        },
      ],
    },
  ],
};
