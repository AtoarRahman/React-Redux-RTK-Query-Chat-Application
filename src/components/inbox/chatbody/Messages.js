import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Message from "./Message";
import { messagesApi } from "../../../features/messages/messagesApi";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Messages({ messages = [], totalCount, conversationId }) {
    const { user } = useSelector((state) => state.auth) || {};
    const { email } = user || {};

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const dispatch = useDispatch();

    const fetchMore = () => {
        setPage((prevPage) => prevPage + 1);
    };

    useEffect(() => {
        if (page > 1) {
            dispatch(
                messagesApi.endpoints.getMoreMessages.initiate({
                    id: conversationId,
                    page,
                    senderEmail:email,
                })
            );
        }
    }, [page, conversationId, dispatch, email]);

    useEffect(() => {
        if (totalCount > 0) {
            const more =
                Math.ceil(
                    totalCount /
                        Number(process.env.REACT_APP_MESSAGES_PER_PAGE)
                ) > page;

            setHasMore(more);
        }
    }, [totalCount, page]);

    return (
        <div id="scrollableDiv" className="relative w-full h-[calc(100vh_-_197px)] p-6 overflow-auto flex flex-col-reverse">
            <InfiniteScroll
                dataLength={messages.length}
                next={fetchMore}
                style={{ display: "flex", flexDirection: "column-reverse" }}
                hasMore={hasMore}
                inverse={true}
                loader={<h4 className="mb-6 text-center">Loading...</h4>}
                scrollableTarget="scrollableDiv"
                height={472}
            >
            <ul className="space-y-2">
                {messages
                    .slice()
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((message) => {
                        const {
                            message: lastMessage,
                            id,
                            sender,
                        } = message || {};

                        const justify =
                            sender.email !== email ? "start" : "end";

                        return (
                            <Message
                                key={id}
                                justify={justify}
                                message={lastMessage}
                            />
                        );
                    })}
            </ul>
        </InfiniteScroll>
        </div>
    );
}
