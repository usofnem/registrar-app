import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

export default function Faq() {
  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>What is Decentralized Domain Name ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            As we know Domain is our address on the internet that can be recognized by internet users wherever they are. Names are the easiest way to explain to the world about us and the internet has made it easy.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, mb: 2}}>
            So what is a decentralized domain name? This is a new breakthrough in the world of the internet and we all know it as web3. The difference between a domain name in general and a decentralized one is not that much, because the same internet address can be accessed by everyone. Of course for now web3 can't run independently at its address and still needs the power of web2. But this is just the beginning and of course things will get even more amazing in the future.
          </Typography>
          <Typography variant="body2">
            Decentralized domains are permanent, cannot be deleted and have no time limit, will always exist forever. Then how do we get the name we want but it already has an owner? Through the NFT market, because all Domain names are there and anyone can sell and buy. It is because of its permanent nature that we believe that there are many benefits that we can manage with this decentralized domain name.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2}}>
            There are tons of ideas still hidden, and you shouldn't miss them, because this is just the beginning.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Do we have to understand coding to be able to manage this domain name ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            You don't have to, but try to learn a little bit about the solidity programming language. Because this is the basis for managing web3 which is actually simpler and easier than web2.
          </Typography>
          <Typography variant="body2"  sx={{ mt: 2}}>
            But if you don't have the time and coding skills but have an idea, find a friend who can implement your brilliant ideas. Of course I'm sure they will be very happy and excited, because usually developers don't have many ideas but have extraordinary duplicating abilities.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography>What Are the Benefits of Domain Names on Blockchain ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            I dare say there are many benefits to a decentralized domain. For this first stage my mission is to collect lots of domain names and get everyone to do the same. When you register this domain name you should not combine it with an extension such as .com, .eth or the like. So the extension will be separated by name but will be combined when associated with the wallet address. Why ? this will provide a lot of benefits, when this contract has billions of names and social media switches to web3 it will be very easy to connect. Call this username, and make a name without using spaces.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, mb: 2}}>
            For the first phase you will be able to use this domain name into a profile page that contains links such as linktree and others. Of course there is no longer a monthly fee, as long as there is a fee to rent a server the profile page will still exist. Another solution is to manage independently with your hosting or if you are a developer you can find extra pocket money by creating pages for other people from your tens or hundreds of domain name collections.
          </Typography>
          <Typography variant="body2">
            It only takes a few lines of code and a smart contract to run it and you can already have a new job. There is much more that can be managed with this domain name, such as creating a blog and publishing it on the blockchain. Or if you're an artist, you can offer your collection of art using just this domain name. Claim a domain name according to the style and title of your work then record your work and offer it in any marketplace. Easy
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography>Where is the contract deploy and what is the network ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            According the roadmad, we have plan to deploy this project to multiple chain with evm support like BNB, ETH, POLYGON, AVAX, KCC and more.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2}}>
            And we use only one smartcontract address (0x9c6292e497f8fe023abcfc3 bab3a5895a9180861) with multiple chain.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
