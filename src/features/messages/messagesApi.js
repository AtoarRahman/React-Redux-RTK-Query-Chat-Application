/* eslint-disable eqeqeq */
import io from "socket.io-client";
import { apiSlice } from "../api/apiSlice";

export const messagesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: ({id, senderEmail}) =>
                `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,

            transformResponse(apiResponse, meta) {
                const totalCount = meta.response.headers.get("X-Total-Count");
                return {
                    data: apiResponse,
                    totalCount,
                };
            },
            
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                // create socket
                const socket = io(process.env.REACT_APP_API_URL, {
                    reconnectionDelay: 1000,
                    reconnection: true,
                    reconnectionAttemps: 10,
                    transports: ["websocket"],
                    agent: false,
                    upgrade: false,
                    rejectUnauthorized: false,
                });
                
                try {
                    await cacheDataLoaded;
                    socket.on("message", (data) => {
                        updateCachedData((draft) => {
                            
                            const conversationId = data.data.conversationId;
                            const receiverEmail = data.data.receiver.email;

                            if(conversationId == arg.id && receiverEmail == arg.senderEmail){
                                return {
                                    data: [
                                        ...draft.data,
                                        data.data,
                                    ],
                                    totalCount: Number(draft.totalCount),
                                };                            
                            }
                        });
                    });
                } catch (err) {
                    console.log(err);
                }

                await cacheEntryRemoved;
                socket.close();
            },
        }),
        getMoreMessages: builder.query({
            query: ({id, page, senderEmail}) =>
                `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
                async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const messages = await queryFulfilled;

                    if (messages?.data?.length > 0) {

                        
                        // update messages cache pessimistically start
                        dispatch(
                            apiSlice.util.updateQueryData(
                                "getMessages",
                                {
                                    id: arg.id.toString(),
                                    senderEmail: arg.senderEmail,
                                },
                                (draft) => {
                                    console.log(messages)
                                    return {
                                        data: [
                                            ...messages.data,
                                            ...draft.data,
                                        ],
                                        totalCount: Number(draft.totalCount),
                                    };
                                }
                            )
                        );
                        // update messages cache pessimistically end
                    }
                } catch (err) {}
            },
        }),
        addMessage: builder.mutation({
            query: (data) => ({
                url: "/messages",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi;
