import { useModal } from '@/ctx';
import { moderateScale } from '@/utils/style';
import React from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as ProgressBar from 'react-native-progress';
import { MediumText } from './text/MediumText';
import { RegularText } from './text/RegularText';

const { width: deviceWidth } = Dimensions.get('window');

interface DownloadModalProps {
  plan_id: string;
}

export default function DownloadModal() {
  const { isModalVisible, hideModal } = useModal();

  return (
    <Modal
      transparent={true}
      visible={isModalVisible}
      onRequestClose={hideModal}
    >
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { width: deviceWidth - 20 }]}>
          <MediumText
            fontSize={16}
            lineHeight={27}
            textAlign='left'
          >
            다운로드중입니다...
          </MediumText>

          {/* loading state */}
          <View style={{ marginVertical: moderateScale(8) }}>
            <ProgressBar.Bar color='#4F5FFF' progress={0.4} width={null} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <RegularText>
                1/5
              </RegularText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={hideModal}>
              <MediumText
                fontSize={16}
                color='#4F5FFF'
              >
                취소하기
              </MediumText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  modalContainer: {
    padding: moderateScale(18),
    backgroundColor: '#3A3A3B',
    borderRadius: 10,
  },
});