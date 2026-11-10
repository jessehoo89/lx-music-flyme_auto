import { memo } from 'react'
import { View, TouchableOpacity } from 'react-native'

import Section from '../components/Section'
// import Button from './components/Button'

import { createStyle, openUrl } from '@/utils/tools'
// import { showPactModal } from '@/navigation'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import Text from '@/components/common/Text'
import { showPactModal } from '@/core/common'

// const qqGroupUrl = 'mqqopensdkapi://bizAgent/qm/qr?url=http%3A%2F%2Fqm.qq.com%2Fcgi-bin%2Fqm%2Fqr%3Ffrom%3Dapp%26p%3Dandroid%26jump_from%3Dwebapi%26k%3Du1zyxek8roQAwic44nOkBXtG9CfbAxFw'
// const qqGroupUrl2 = 'mqqopensdkapi://bizAgent/qm/qr?url=http%3A%2F%2Fqm.qq.com%2Fcgi-bin%2Fqm%2Fqr%3Ffrom%3Dapp%26p%3Dandroid%26jump_from%3Dwebapi%26k%3D-l4kNZ2bPQAuvfCQFFhl1UoibvF5wcrQ'
// const qqGroupWebUrl = 'https://qm.qq.com/cgi-bin/qm/qr?k=jRZkyFSZ4FmUuTHA3P_RAXbbUO_Rrn5e&jump_from=webapi'
// const qqGroupWebUrl2 = 'https://qm.qq.com/cgi-bin/qm/qr?k=HPNJEfrZpBZ9T8szYWbe2d5JrAAeOt_l&jump_from=webapi'

export default memo(() => {
  const theme = useTheme()
  const t = useI18n()
  const openHomePage = () => {
    void openUrl('https://github.com/jessehoo89/lx-music-flyme_auto#readme')
  }
  const openIssuePage = () => {
    void openUrl('https://github.com/jessehoo89/lx-music-flyme_auto/issues')
  }
  const openDocPage = () => {
    void openUrl('https://github.com/jessehoo89/lx-music-flyme_auto/blob/main/FLYME.md')
  }
  const openFAQPage = () => {
    void openUrl('https://lyswhut.github.io/lx-music-doc/mobile/faq')
  }
  // const openIssuesPage = () => {
  //   openUrl('https://github.com/lyswhut/lx-music-mobile/issues')
  // }
  const openPactModal = () => {
    showPactModal()
  }
  const openPartPage = () => {
    void openUrl('https://github.com/lyswhut/lx-music-mobile#%E9%A1%B9%E7%9B%AE%E5%8D%8F%E8%AE%AE')
  }

  // const goToQQGroup = () => {
  //   openUrl(qqGroupUrl).catch(() => {
  //     void openUrl(qqGroupWebUrl)
  //   })
  // }
  // const goToQQGroup2 = () => {
  //   openUrl(qqGroupUrl2).catch(() => {
  //     void openUrl(qqGroupWebUrl2)
  //   })
  // }

  const textLinkStyle = {
    ...styles.text,
    textDecorationLine: 'underline',
    color: theme['c-primary-font'],
    // fontSize: 14,
  } as const


  return (
    <Section title={t('setting_about')}>
      <View style={styles.part}>
        <Text style={styles.text} >本软件完全免费，代码已开源。本车机版源码地址：</Text>
        <TouchableOpacity onPress={openHomePage}>
          <Text style={textLinkStyle}>https://github.com/jessehoo89/lx-music-flyme_auto</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>车机适配说明与更新记录：</Text>
        <TouchableOpacity onPress={openDocPage}>
          <Text style={textLinkStyle}>FLYME.md</Text>
        </TouchableOpacity>
        <Text style={styles.text}>（上游原版说明见仓库 README）</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text} >上游移动版的常见问题可转至：</Text>
        <TouchableOpacity onPress={openFAQPage}>
          <Text style={textLinkStyle}>移动版常见问题</Text>
        </TouchableOpacity>
        <Text style={styles.text}>（车机相关见上方 FLYME.md）</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}><Text style={styles.boldText}>本软件没有客服</Text>，但我们整理了一些常见的使用问题。<Text style={styles.boldText} >仔细、仔细、仔细</Text>地阅读常见问题后，</Text>
        <Text style={styles.text}>仍有问题可到本仓库 GitHub </Text>
        <TouchableOpacity onPress={openIssuePage}>
          <Text style={textLinkStyle}>提交 Issue</Text>
        </TouchableOpacity>
        <Text style={styles.text}>。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>由于软件开发的初衷仅是为了对新技术的学习与研究，因此软件直至停止维护都将会一直保持纯净。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>本车机版的发布地址<Text style={styles.boldText}>只有 GitHub</Text>，其他渠道均为第三方转载发布，可信度请自行鉴别。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}><Text style={styles.boldText}>本车机版没有微信公众号之类的所谓「官方账号」，也未在任何应用商店发布，仅通过上面的源码仓库分发；其它同名应用均与本车机版无关，谨防被骗！</Text></Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>本车机版不含任何<Text style={styles.boldText}>广告</Text>与<Text style={styles.boldText}>引流</Text>。若你遇到需要加群、关注公众号之类才能使用或者升级的信息，则说明这个安装包已被他人二次修改，请勿使用。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>本车机版使用独立包名 <Text style={styles.boldText}>cn.toside.music.mobile.flyme</Text> 与自建签名，可与上游官方版共存、互不影响。若升级时提示「<Text style={styles.boldText}>签名不一致</Text>」，说明待装的包并非来自本仓库，请勿安装。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>你已签署本软件的</Text>
        <TouchableOpacity onPress={openPactModal}><Text style={styles.text} color={theme['c-primary-font']}>许可协议</Text></TouchableOpacity>
        <Text style={styles.text}>，协议的在线版本在</Text>
        <TouchableOpacity onPress={openPartPage}><Text style={textLinkStyle}>这里</Text></TouchableOpacity>
        <Text style={styles.text}>。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.boldText}>LX Music 车机独立适配版（flyme_auto）</Text>
        <Text style={styles.text}>基于上游 LX Music 移动版 {process.versions.app} 定制，内置车机媒体中心接入能力，不再需要额外的车机助手；针对超宽车机屏幕调整了字号与布局，并移除了无法使用的桌面歌词。</Text>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>本项目沿用上游 Apache-2.0 许可，源码地址：</Text>
        <TouchableOpacity onPress={() => { void openUrl('https://github.com/jessehoo89/lx-music-flyme_auto') }}>
          <Text style={textLinkStyle}>https://github.com/jessehoo89/lx-music-flyme_auto</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>上游作者：</Text>
        <Text style={styles.text}>落雪无痕</Text>
        <Text style={styles.text}>　车机适配：</Text>
        <Text style={styles.text}>jessehoo89</Text>
      </View>
    </Section>
  )
})

const styles = createStyle({
  part: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 14,
    textAlignVertical: 'bottom',
  },
  boldText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlignVertical: 'bottom',
  },
  throughText: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    textAlignVertical: 'bottom',
  },
  btn: {
    flexDirection: 'row',
  },
})
