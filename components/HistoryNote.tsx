import { formatPrayerTime } from "@/utils/date";
import { moderateScale } from "@/utils/style";
import { TouchableOpacity, View } from "react-native";
import { MediumText } from "./text/MediumText";
import { RegularText } from "./text/RegularText";

export default function HistoryNote({
  note, created_date, duration, onPressNote, testID
}: {
  note: string;
  created_date: number;
  duration: number;
  onPressNote: () => void;
  testID?: string;
}) {

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPressNote}
    >
      <View style={{
        marginTop: moderateScale(12),
        paddingVertical: moderateScale(18),
        paddingHorizontal: moderateScale(16),
        borderRadius: moderateScale(10),
        backgroundColor: 'rgba(31, 31, 31, 0.5)'
      }}>
        {
          (note === null || note === '') ? (
            <RegularText
              style={{ marginBottom: moderateScale(8) }}
              color="#B3B3B3"
              fontSize={14}
              lineHeight={26}
            >
              기도 메모를 남겨주세요.
            </RegularText>
          ) : (
            <RegularText
              style={{ marginBottom: moderateScale(8) }}
              fontSize={16}
              lineHeight={28}
              numberOfLines={4}
              ellipsizeMode='tail'
            >
              {note}
            </RegularText>
          )
        }
        <MediumText
          color="#B3B3B3"
          fontSize={14}
          lineHeight={26}
        >
          {formatPrayerTime(created_date, duration)}
        </MediumText>
      </View >
    </TouchableOpacity>
  )
}
