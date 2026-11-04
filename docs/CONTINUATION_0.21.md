# 0.21 native AI mechanics work checkpoint

Base20d6c6c, branchwork/ai-mechanics-021. User explicitly rejects a level53-specific patch; demands general original mechanics. No map or source presets edited. Native BotStateSimulator, Move, intersection and goalReached now ported in source-ai-simulation.js. 168 original ARM64 timelines pass exactly (plus epsilon for single precision). Native Population.TryPopulate now ported in source-population.js;60 original ARM64 timelines pass. Native scripts load ../native-019/libil2cpp.so (sha e1ebe8dd...) with Unicorn via PYTHONPATH=../.tools-019/py. No binary or signing key committed.

Production JS changes active inengine: burst metadata for native group snapshots, integer production and half-second native production block;capacity truncation;loadedsource-population beforeengine inindex. AI: native aggregate snapshot (flying groups only), outgoing/incoming order, capturedstateinfos, sourceweight exp(-1.5*average), correctattack validation(neutralnotfilteredbyadvantage), capturedlimits(player+neutral), defence availability.

NOT RELEASED YET. npm test396:389pass7fail; old tests assumedcontinuous production (5), no neutral candidate(1), oldlevel11replay(1). Need update these with native expected behavior and find freshordinary-winningreplay without nerfingAI. Need confirm V4 scoremathwithexecutableoracle, V5delta math still approximate, someabilitiesunknown. movementPacing.5 remains ownrelease setting. Never claim full100percentnative parity.

Next: nativearithmeticcases, meaningful integrationtests, fullNode+affectedUI, version0.21/code22, guardedassetbuild fromsigned0.20 sha182345de...,signprivate ../.signing-019/key,extractverifyruntime,saveAPKandPublishPacktoLibraryandGitHub. See0.20continuationforhelpersandfullpaths.
