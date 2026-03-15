import type { Metadata, ResolvingMetadata } from 'next';
import { classApi } from '@/lib/api';
import { ClientReservationFlow } from './ClientReservationFlow';

type Props = {
    params: Promise<{ classCode: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { classCode } = await params;
    
    try {
        const classDetail = await classApi.getByClassCode(classCode);
        
        return {
            title: `${classDetail.name} | Class Hub`,
            description: classDetail.description || '내 취향에 딱 맞는 원데이 클래스를 예약해보세요.',
            openGraph: {
                title: classDetail.name,
                description: classDetail.description || '내 취향에 딱 맞는 원데이 클래스를 예약해보세요.',
                images: classDetail.imageUrls?.[0] ? [classDetail.imageUrls[0]] : [],
                type: 'website',
            },
        };
    } catch (e) {
        return {
            title: '클래스를 찾을 수 없습니다 | Class Hub',
        };
    }
}

export default async function ClassEnrollmentPage({ params }: Props) {
    const { classCode } = await params;

    try {
        const classDetail = await classApi.getByClassCode(classCode);
        
        if (classDetail.linkShareStatus !== 'ENABLED') {
            return (
                <div className="min-h-screen bg-[#F2F4F6] flex justify-center items-center p-4">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🔒</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#191F28] mb-3">
                            접근할 수 없는 클래스입니다
                        </h2>
                        <p className="text-[#6B7684] leading-relaxed">
                            이 클래스는 현재 링크 공유가 비활성화되어 있어<br />
                            신청을 받지 않고 있습니다.
                        </p>
                    </div>
                </div>
            );
        }

        const sessions = await classApi.getSessionsByClassId(classDetail.id).catch(() => []);

        return (
            <ClientReservationFlow 
                classCode={classCode} 
                classDetail={classDetail} 
                sessions={sessions} 
            />
        );
    } catch (e) {
        return (
            <div className="min-h-screen bg-[#F2F4F6] flex justify-center items-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#191F28] mb-3">
                        존재하지 않는 클래스입니다
                    </h2>
                    <p className="text-[#6B7684] leading-relaxed">
                        잘못된 링크이거나 삭제된 클래스입니다.
                    </p>
                </div>
            </div>
        );
    }
}
