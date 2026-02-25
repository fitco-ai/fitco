import { NextResponse } from 'next/server';
import { sendRecommendation } from './cart/sendRecommendation';
import { collectBoards } from './collect/boards';
import { collectOrders } from './collect/orders';
import { forceRefreshTokens } from './token/forceRefreshTokens';

export async function GET() {
  try {
    try {
      console.log('주문 수집을 시작합니다...');
      await collectOrders();
      console.log('주문 수집이 완료되었습니다.');
    } catch (error) {
      console.error('주문 수집 중 오류가 발생했습니다:', error);
      throw error;
    }
    try {
      console.log('게시판 수집을 시작합니다...');
      await collectBoards();
      console.log('게시판 수집이 완료되었습니다.');
    } catch (error) {
      console.error('게시판 수집 중 오류가 발생했습니다:', error);
      throw error;
    }
    try {
      console.log('토큰 갱신을 시작합니다...');
      await forceRefreshTokens();
      console.log('토큰 갱신이 완료되었습니다.');
    } catch (error) {
      console.error('게시판 수집 중 오류가 발생했습니다:', error);
      throw error;
    }
    try {
      console.log('추천 메시지 전송을 시작합니다...');
      await sendRecommendation();
      console.log('추천 메시지 전송이 완료되었습니다.');
    } catch (error) {
      console.error('추천 메시지 전송 중 오류가 발생했습니다:', error);
      throw error;
    }
    return NextResponse.json({}, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
