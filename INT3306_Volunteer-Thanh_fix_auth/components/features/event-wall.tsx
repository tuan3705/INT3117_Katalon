// A client component for the event's communication wall.
// components/features/event-wall.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';


interface Post {
    id: string;
    content: string;
    createdAt: string;
    author: {
        name: string | null;
        email: string | null;
    };
}

type EventWallProps = {
    eventId: string;
    isRegistered: boolean;
};

export const EventWall = ({ eventId, isRegistered }: EventWallProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: session, status } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);





    // When componenet is rendered first time, run the function once
    // Just run again when eventId change, to fetch post of just the event
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`/api/events/${eventId}/posts`);
                // Structural Typing is crazy :)
                setPosts(response.data);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [eventId]);


    const handleSubmitPost = async (e: React.FormEvent) => {
        e.preventDefault(); // prevent form from reload
        if (!newPostContent.trim()) return; // exit if no content is found

        try {
            const response = await axios.post(`/api/events/${eventId}/posts`, {
                content: newPostContent,
            });
            // add post in at the head of the list to update the UI immediately
            setPosts([response.data, ...posts]);
            setNewPostContent(''); // delete content in the form
        } catch (error) {
            console.error('Failed to submit post:', error);
        }
    };

    // only show the post form if user registered and logged in
    const canPost = status === 'authenticated' && isRegistered;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Kênh trao đổi</h2>

            {/* Post form */}
            {canPost && (
                <form onSubmit={handleSubmitPost} className="mb-8">
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Bạn có câu hỏi hoặc muốn chia sẻ điều gì?"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                    />
                    <button type="submit" className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Đăng bài
                    </button>
                </form>
            )}

            {/* Post list */}
            <div className="space-y-4">
                {isLoading ? (
                    <p>Đang tải bài viết...</p>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.id} className="p-4 bg-gray-50 rounded-lg border">
                            <p className="font-semibold text-gray-800">{post.author.name || post.author.email}</p>
                            <p className="text-gray-600 my-2">{post.content}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(post.createdAt).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Chưa có bài viết nào. Hãy là người đầu tiên!</p>
                )}
            </div>
        </div>
    );
};