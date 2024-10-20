import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';

export function TokenLaunchpad() {

    const wallet = useWallet();
    const { connection } = useConnection();

    async function createToken() {
        let name = document.getElementById('name').value;
        let symbol = document.getElementById('symbol').value;
        let url = document.getElementById('url').value;
        let decimal = document.getElementById('decimal').value;
        let initialSupply = document.getElementById('initialSupply').value;

        //metadata initialization
        const keyPair = Keypair.generate();
        const metadata = {
            mint: keyPair.publicKey,
            name: name,
            symbol: symbol,
            uri: url,
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

        //create mint txn
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);


        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: keyPair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(keyPair.publicKey, wallet.publicKey, keyPair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(keyPair.publicKey, decimal, wallet.publicKey, wallet.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: keyPair.publicKey,
                metadata: keyPair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );

        //SIGN Transaction
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(keyPair);

        await wallet.sendTransaction(transaction, connection);

        console.log(`Token mint created at ${keyPair.publicKey.toBase58()}`);

        const associatedToken = getAssociatedTokenAddressSync(
            keyPair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
        );

        console.log(associatedToken.toBase58());

        //ATA Creation INSTRUCTION
        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                keyPair.publicKey,
                TOKEN_2022_PROGRAM_ID,
            ),
        );

        await wallet.sendTransaction(transaction2, connection);

        //minting tokens to the address INSTRUCTION
        const transaction3 = new Transaction().add(
            createMintToInstruction(keyPair.publicKey, associatedToken, wallet.publicKey, initialSupply, [], TOKEN_2022_PROGRAM_ID)
        );

        await wallet.sendTransaction(transaction3, connection);

        console.log("Minted!")
    }


    return <div className="" style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <div className="border border-white rounded-xl px-40 py-16">
            <h1 className="mb-10 text-center font-sans text-4xl text-zinc-50  ">Solana Token Launchpad</h1>
            <div className="border border-white rounded-xl  bg-slate-700 ">
                <input className='inputText m-2 p-2 w-96 bg-slate-700 text-white ' type='text' placeholder='Token Name' id="name"></input> <br />
                <input className='inputText m-2 p-2 w-96 bg-slate-700 text-white ' type='text' placeholder='Token Symbol' id="symbol"></input> <br />
                <input className='inputText m-2 p-2 w-96 bg-slate-700 text-white ' type='text' placeholder='Decimal' id="decimal"></input> <br />

                <input className='inputText m-2 p-2 w-96 bg-slate-700 text-white' type='text' placeholder='Image URL' id="url"></input> <br />
                <input className='inputText m-2 p-2 w-96 bg-slate-700 text-white' type='text' placeholder='Initial Supply' id="initialSupply"></input> <br />

            </div>
            <button onClick={createToken} className='btn border border-slate-700 border-slate-50 w-96  rounded-xl  p-4 mt-12 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500 center'>Create a token</button>
        </div>
    </div>
}