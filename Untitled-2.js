/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ImageBackground,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Icon} from 'native-base';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import ico_incrementacao from '../assets/ico_incrementacao.png';
import ico_bugfix from '../assets/ico_bugfix.png';
import ico_tarefa from '../assets/ico_tarefa.png';
import {useNavigation, useRoute} from '@react-navigation/native';
import HeaderSearch from '../components/HeaderSearch/HeaderSearch';
import Header from '../components/Header/Header';
import api from '../api/api';

function Item({item}) {
  var data = new Date();
  var dia = data.getDate();
  var mes = data.getMonth();
  var ano = data.getFullYear();
  const DATA = new Array(dia, mes, ano);

  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('TarefasInfo', item)}>
      <View style={styles.cardCarousel}>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View style={{flex: 1}}>
            <Text style={styles.estiloTextoTitulo}>{item.code}</Text>
          </View>

          <View style={{alignItems: 'flex-end'}}>
            <Image
              style={{marginRight: 10, marginTop: 10}}
              source={
                item.type === 'Incrementação'
                  ? ico_incrementacao
                  : item.type === 'Bugfix'
                  ? ico_bugfix
                  : item.type === 'Tarefa' || 'task'
                  ? ico_tarefa
                  : null
              }
            />
            {item.dueDate ? (
              <Text style={{marginRight: 10, marginTop: 10}}>
                {item.dueDate}
              </Text>
            ) : null}
          </View>
        </View>

        <Text numberOfLines={1} style={styles.estiloTextoDescricao}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const Carousel1 = ({navigation}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [dadosTarefa, setDadosTarefa] = useState([]);
  const [estaPesquisando, setEstaPesquisando] = useState(false);
  const [filtroSearch, setFiltroSearch] = useState('');
  const {params: tarefas} = useRoute();

  const [dadosFiltrado, setDadosFiltrado] = useState('');

  //Chamando Api
  useEffect(() => {
    (async function listarTarefas() {
      api
        .get('/tarefas/' + tarefas.id)
        .then(function(response) {
          setDadosTarefa(response.data);
        })
        .catch(function(error) {
          console.log(error);
        });
    })();
  }, [tarefas.id]);

  //Pesquisando tarefas
  useEffect(() => {
    navigation.setOptions({
      header:
        estaPesquisando === true
          ? propriedade => (
              <HeaderSearch
                {...propriedade}
                onChangeTextSearch={setFiltroSearch}
                estaPesquisando={estaPesquisando}
                setEstaPesquisando={setEstaPesquisando}
              />
            )
          : Header,

      headerRight: () => (
        <TouchableOpacity onPress={() => setEstaPesquisando(true)}>
          <Icon name="search" size={26} style={{color: 'white'}} />
        </TouchableOpacity>
      ),
    });
  }, [estaPesquisando, navigation]);

  useEffect(() => {
    if (!dadosTarefa) {
      return;
    }
    const dadosFiltrado = dadosTarefa.filter(item => {
      if (
        item.code.toUpperCase().includes(filtroSearch.toUpperCase()) === false
      ) {
        return false;
      }
      return true;
    });

    setDadosFiltrado(dadosFiltrado);
  }, [dadosTarefa, filtroSearch, tarefas]);

  //Colocando tipo do projeto no header da tela
  navigation.setOptions({
    title: tarefas.title,
  });
  
  const dadosCarousel = [];

  dadosCarousel[0] = {tarefas:[], grupo:'OPEN', tamanho:0}
  dadosCarousel[0].tarefas = dadosTarefa.filter(tarefa => tarefa.status == 'OPEN');
  dadosCarousel[0].tamanho = dadosCarousel.tarefas.length;

  dadosCarousel[1] = {tarefas:[], grupo:'CLOSE', tamanho:0}
  dadosCarousel[1].tarefas = dadosTarefa.filter(tarefa => tarefa.satus == 'CLOSED');
  dadosCaroul[1].tamanho = dadosCarousel.tarefas.length;
  

  const _renderItem = ({item, index}) => {
    return (
      <FlatList
        style={{
          margin: 20,
          borderRadius: 10,
          backgroundColor: 'transparent',
        }}
        contentContainerStyle={{
          borderRadius: 10,
          backgroundColor: 'white',
        }}
        ListHeaderComponent={
          <>
            <View style={styles.titleView}>
              <Text style={styles.titleText}>{item.titulo}</Text>
              <Text style={styles.qtItens}>({item.tamanho})</Text>
            </View>
            <View
              style={{
                marginLeft: 20,
                width: '90%',
                marginBottom: 25,
                borderBottomWidth: StyleSheet.hairlineWidth,
                backgroundColor: 'white',
              }}
            />
          </>
        }
        keyExtractor={(item, index) => index.toString()}
        data={tarefasGrupoArray}
        renderItem={({item}) => <Item item={item} />}
      />
    );
  };

  const {width} = Dimensions.get('window');

  return (
    <ImageBackground
      source={require('../assets/background-kanban.png')}
      style={{flex: 1}}>
      <Carousel
        data={dadosCarousel}
        renderItem={_renderItem}
        lockScrollWhileSnapping={true}
        lockScrollTimeoutDuration={200}
        onSnapToItem={index => setActiveSlide(index)}
        sliderWidth={width}
        itemWidth={width}
        containerCustomStyle={{
          marginBottom: 50,
        }}
      />

      <Pagination
        dotsLength={dadosTarefa.length}
        activeDotIndex={activeSlide}
        dotStyle={{
          width: 15,
          height: 15,
          borderRadius: 20,
          marginHorizontal: 8,
          backgroundColor: '#fff',
          elevation: 1,
        }}
        inactiveDotStyle={{
          width: 15,
          height: 15,
          borderRadius: 20,
          marginHorizontal: 8,
          backgroundColor: '#a9a9a9',
          elevation: 1,
        }}
        inactiveDotOpacity={1}
        inactiveDotScale={0.6}
      />
    </ImageBackground>
  );
};

export default Carousel1;

const styles = StyleSheet.create({
  titleText: {
    fontWeight: 'bold',
    color: '#2D939C',
    paddingTop: 10,
    marginLeft: 10,
    fontSize: 16,
  },
  qtItens: {
    color: '#00000099',
    paddingTop: 10,
    marginLeft: 10,
    fontSize: 16,
  },
  titleView: {
    borderColor: '#00000099',
    flexDirection: 'row',
    paddingBottom: 20,
  },
  estiloTextoTitulo: {
    fontSize: 17,
    marginTop: 7,
    paddingLeft: 7,
    marginBottom: 7,
  },
  estiloTextoDescricao: {
    marginTop: 7,
    paddingLeft: 7,
    marginBottom: 7,
    color: '#00000099',
  },

  cardCarousel: {
    borderWidth: 0.4,
    width: '90%',
    marginBottom: 15,
    alignSelf: 'center',
    borderRadius: 5,
    borderColor: '#0000004D',
  },
});
